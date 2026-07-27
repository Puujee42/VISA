import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";
import { checkQPayPayment } from "@/lib/qpay";

type InternalStatus =
  | "pending"
  | "processing"
  | "paid"
  | "expired"
  | "failed"
  | "cancelled";

function normalizeQPayStatus(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase();
}

function isPaidFromPayload(payload: Record<string, unknown>): boolean {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  const hasPaidRow = rows.some((r: Record<string, unknown>) => {
    const s = normalizeQPayStatus(r?.payment_status || r?.status);
    return s === "paid" || s === "success" || s === "completed";
  });
  const paidAmount = Number(payload?.paid_amount || 0);
  return hasPaidRow || paidAmount > 0;
}

function derivePendingStatus(payload: Record<string, unknown>): InternalStatus {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  if (rows.length > 0) return "processing";
  return "pending";
}

function safeStatusForOrder(status: string): InternalStatus {
  const allowed: InternalStatus[] = [
    "pending", "processing", "paid", "expired", "failed", "cancelled",
  ];
  return allowed.includes(status as InternalStatus) ? (status as InternalStatus) : "pending";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const invoiceId = searchParams.get("invoiceId");

    if (!orderId || !invoiceId) {
      return NextResponse.json(
        { error: "orderId and invoiceId are required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr) throw orderErr;
    const order = toApi(orderRow);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (String(order.qpayInvoiceId) !== invoiceId) {
      return NextResponse.json({ error: "Invoice does not match order" }, { status: 400 });
    }

    if (order.status === "paid") {
      return NextResponse.json({
        paid: true,
        status: "paid",
        paidAmount: Number(order.paidAmount ?? order.amount ?? 0),
        orderId: order._id,
        invoiceId: String(order.qpayInvoiceId),
      });
    }

    if (order.status === "expired" || order.status === "cancelled") {
      return NextResponse.json({
        paid: false,
        status: order.status,
        paidAmount: 0,
        orderId: order._id,
        invoiceId: String(order.qpayInvoiceId),
      });
    }

    const paymentStatus = await checkQPayPayment(invoiceId);
    const paid = isPaidFromPayload(paymentStatus as Record<string, unknown>);

    if (!paid) {
      const nextStatus = safeStatusForOrder(
        derivePendingStatus(paymentStatus as Record<string, unknown>),
      );

      if (order.status !== "paid" && order.status !== nextStatus) {
        await supabase
          .from("orders")
          .update({ status: nextStatus, qpay_raw_check: paymentStatus })
          .eq("id", order._id);
      }

      return NextResponse.json({
        paid: false,
        status: order.status === "paid" ? "paid" : nextStatus,
        paidAmount: 0,
        orderId: order._id,
        invoiceId: String(order.qpayInvoiceId),
      });
    }

    const paidAmount =
      Number((paymentStatus as Record<string, unknown>)?.paid_amount) ||
      Number(
        Array.isArray((paymentStatus as Record<string, unknown>)?.rows)
          ? ((paymentStatus as { rows: Record<string, unknown>[] }).rows[0]?.paid_amount)
          : 0,
      ) ||
      Number(order.amount) ||
      0;

    const now = new Date().toISOString();

    const { data: transitioned } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: now,
        paid_amount: paidAmount,
        qpay_raw_check: paymentStatus,
      })
      .eq("id", order._id)
      .in("status", ["pending", "processing"])
      .select()
      .maybeSingle();

    if (transitioned) {
      await supabase.rpc("decrement_stock", {
        p_item_id: transitioned.item_id,
        p_quantity: transitioned.quantity,
      });
    }

    const finalOrder = toApi(transitioned) ?? order;

    return NextResponse.json({
      paid: true,
      status: "paid",
      paidAmount: Number(finalOrder.paidAmount ?? paidAmount),
      orderId: finalOrder._id,
      invoiceId: String(finalOrder.qpayInvoiceId),
    });
  } catch (error: unknown) {
    console.error("QPay check-payment error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to check QPay payment status", detail: message },
      { status: 500 },
    );
  }
}
