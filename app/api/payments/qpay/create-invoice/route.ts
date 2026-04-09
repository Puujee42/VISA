import { NextResponse } from "next/server";
import { connectToDBWithRetry } from "@/lib/db";
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

function isDbConnectionError(err: any): boolean {
  const name = String(err?.name ?? "");
  const msg = String(err?.message ?? "");
  const code = String(err?.code ?? err?.cause?.code ?? "");

  return (
    name === "MongoNetworkError" ||
    name === "MongoServerSelectionError" ||
    code === "ECONNRESET" ||
    msg.includes("ECONNRESET") ||
    msg.includes("connect ETIMEDOUT") ||
    msg.includes("Could not connect") ||
    msg.includes("topology was destroyed")
  );
}

export async function POST(req: Request) {
  try {
    // ── 1. Parse + validate body ─────────────────────────────────────────────
    let body: CreateInvoiceBody;
    try {
      body = (await req.json()) as CreateInvoiceBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

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

    // ── 2. Connect (retries once on ECONNRESET / Atlas idle timeout) ─────────
    try {
      await connectToDBWithRetry(2);
    } catch (dbErr: any) {
      console.error(
        "QPay create-invoice: DB connection failed:",
        dbErr?.message,
      );
      return NextResponse.json(
        {
          error: "Database temporarily unavailable. Please try again.",
          detail: dbErr?.message,
        },
        { status: 503 },
      );
    }

    // ── 3. Fetch item ─────────────────────────────────────────────────────────
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

    // ── 4. Build invoice params ───────────────────────────────────────────────
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

    // ── 5. Call QPay ──────────────────────────────────────────────────────────
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
        {
          error:
            "QPay did not return an invoice_id. Check your QPay credentials.",
        },
        { status: 502 },
      );
    }

    const urls: any[] = Array.isArray((qpayInvoice as any)?.urls)
      ? (qpayInvoice as any).urls
      : [];

    // ── 6. Persist order ──────────────────────────────────────────────────────
    const created = await Order.create({
      itemId: item._id,
      itemName,
      quantity,
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

    // ── 7. Return success ─────────────────────────────────────────────────────
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

    // Surface DB errors as 503 so the client knows to retry
    if (isDbConnectionError(error)) {
      return NextResponse.json(
        {
          error:
            "Database temporarily unavailable. Please try again in a few seconds.",
          detail: error?.message,
        },
        { status: 503 },
      );
    }

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
      acceptedEnvVars: {
        preferred: [
          "QPAY_USERNAME",
          "QPAY_PASSWORD",
          "QPAY_INVOICE_CODE",
          "QPAY_BASE_URL",
        ],
        fallback: ["MERCHANT_ID", "PASSWORD", "INVOICE_CODE", "QPAY_URL"],
      },
    },
    { status: 200 },
  );
}
