import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";
import { createQPayInvoice } from "@/lib/qpay";

type CreateInvoiceBody = {
  itemId?: string;
  locale?: string;
  quantity?: number;
};

function getItemName(item: Record<string, unknown>, locale: string) {
  const name = item.name as Record<string, string> | undefined;
  return name?.[locale] || name?.en || name?.mn || name?.de || "Shop Item";
}

export async function POST(req: Request) {
  try {
    let body: CreateInvoiceBody;
    try {
      body = (await req.json()) as CreateInvoiceBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body?.itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const locale = body.locale || "en";
    const quantity = Number(body.quantity || 1);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "quantity must be a positive number" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: itemRow, error: itemErr } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("id", body.itemId)
      .maybeSingle();

    if (itemErr) throw itemErr;
    const item = toApi(itemRow);
    if (!item || !item.isActive) {
      return NextResponse.json({ error: "Item not found or inactive" }, { status: 404 });
    }

    if (typeof item.stock === "number" && item.stock < quantity) {
      return NextResponse.json({ error: "Not enough stock available" }, { status: 409 });
    }

    const itemName = getItemName(item, locale);
    const unitPrice = Number(item.price || 0);
    const amount = unitPrice * quantity;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid item price" }, { status: 400 });
    }

    const senderInvoiceNo = `SHOP-${item._id}-${Date.now()}`;
    const callbackBase =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    const qpayInvoice = await createQPayInvoice({
      senderInvoiceNo,
      invoiceDescription: `${itemName} x${quantity}`,
      amount,
      callbackUrl: callbackBase ? `${callbackBase}/api/payments/qpay/check-payment` : undefined,
      metadata: { itemId: item._id, locale, quantity },
    });

    const invoiceId =
      (qpayInvoice as { invoice_id?: string; invoiceId?: string })?.invoice_id ||
      (qpayInvoice as { invoiceId?: string })?.invoiceId ||
      "";

    if (!invoiceId) {
      return NextResponse.json(
        { error: "QPay did not return an invoice_id. Check your QPay credentials." },
        { status: 502 },
      );
    }

    const urls = Array.isArray((qpayInvoice as { urls?: unknown[] })?.urls)
      ? (qpayInvoice as { urls: unknown[] }).urls
      : [];

    const { data: created, error: orderErr } = await supabase
      .from("orders")
      .insert({
        item_id: item._id,
        item_name: itemName,
        quantity,
        amount,
        currency: "MNT",
        locale,
        status: "pending",
        qpay_invoice_id: invoiceId,
        qpay_qr_text: (qpayInvoice as { qr_text?: string; qrText?: string })?.qr_text ||
          (qpayInvoice as { qrText?: string })?.qrText || "",
        qpay_qr_image: (qpayInvoice as { qr_image?: string; qrImage?: string })?.qr_image ||
          (qpayInvoice as { qrImage?: string })?.qrImage || "",
        qpay_urls: urls,
        qpay_raw: qpayInvoice,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (orderErr) throw orderErr;
    const order = toApi(created)!;

    return NextResponse.json(
      {
        success: true,
        orderId: order._id,
        invoiceId: order.qpayInvoiceId,
        amount: order.amount,
        currency: order.currency,
        qrText: order.qpayQrText,
        qrImage: order.qpayQrImage,
        urls: order.qpayUrls || [],
        expiresAt: order.expiresAt,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("QPay create-invoice error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create QPay invoice", detail: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, note: "dev only" });
}
