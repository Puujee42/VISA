import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import ShoppingItem from "@/lib/models/ShoppingItem";
import Order from "@/lib/models/Order";
import { createQPayInvoice } from "@/lib/qpay";

type CreateInvoiceBody = {
  itemId?: string;
  locale?: string;
  quantity?: number;
};

function getItemName(item: any, locale: string) {
  return (
    item?.name?.[locale] ||
    item?.name?.en ||
    item?.name?.mn ||
    item?.name?.de ||
    "Shop Item"
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateInvoiceBody;

    if (!body?.itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 },
      );
    }

    const locale = body.locale || "en";
    const quantity = Number(body.quantity || 1);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "quantity must be a positive number" },
        { status: 400 },
      );
    }

    await connectToDB();

    const item = await ShoppingItem.findById(body.itemId).lean();
    if (!item || !item.isActive) {
      return NextResponse.json(
        { error: "Item not found or inactive" },
        { status: 404 },
      );
    }

    if (typeof item.stock === "number" && item.stock < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 409 },
      );
    }

    const itemName = getItemName(item, locale);
    const unitPrice = Number(item.price || 0);
    const amount = unitPrice * quantity;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid item price" },
        { status: 400 },
      );
    }

    const senderInvoiceNo = `SHOP-${item._id.toString()}-${Date.now()}`;
    const invoiceDescription = `${itemName} x${quantity}`;

    const callbackBase =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    const qpayInvoice = await createQPayInvoice({
      senderInvoiceNo,
      invoiceDescription,
      amount,
      callbackUrl: callbackBase
        ? `${callbackBase}/api/payments/qpay/check-payment`
        : undefined,
      metadata: {
        itemId: item._id.toString(),
        locale,
        quantity,
      },
    });

    const invoiceId =
      (qpayInvoice as any)?.invoice_id || (qpayInvoice as any)?.invoiceId || "";

    if (!invoiceId) {
      return NextResponse.json(
        { error: "QPay did not return invoice_id" },
        { status: 502 },
      );
    }

    const urls =
      (Array.isArray((qpayInvoice as any)?.urls)
        ? (qpayInvoice as any).urls
        : []) || [];

    const created = await Order.create({
      itemId: item._id,
      itemName,
      amount,
      currency: "MNT",
      locale,
      status: "pending",
      qpayInvoiceId: invoiceId,
      qpayQrText:
        (qpayInvoice as any)?.qr_text || (qpayInvoice as any)?.qrText || "",
      qpayQrImage:
        (qpayInvoice as any)?.qr_image || (qpayInvoice as any)?.qrImage || "",
      qpayUrls: urls,
      qpayRaw: qpayInvoice,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    return NextResponse.json(
      {
        success: true,
        orderId: created._id.toString(),
        invoiceId: created.qpayInvoiceId,
        amount: created.amount,
        currency: created.currency,
        qrText: created.qpayQrText,
        qrImage: created.qpayQrImage,
        urls: created.qpayUrls || [],
        expiresAt: created.expiresAt,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("QPay create-invoice error:", error);

    return NextResponse.json(
      {
        error: "Failed to create QPay invoice",
        detail: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      endpoint: "create-qpay-invoice",
      requiredEnv: ["QPAY_USERNAME", "QPAY_PASSWORD", "QPAY_INVOICE_CODE"],
    },
    { status: 200 },
  );
}
