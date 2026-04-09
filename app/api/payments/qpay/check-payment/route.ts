import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import ShoppingItem from "@/lib/models/ShoppingItem";
import { checkQPayPayment } from "@/lib/qpay";

type InternalStatus =
  | "pending"
  | "processing"
  | "paid"
  | "expired"
  | "failed"
  | "cancelled";

function normalizeQPayStatus(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

function isPaidFromPayload(payload: any): boolean {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  const hasPaidRow = rows.some((r: any) => {
    const s = normalizeQPayStatus(r?.payment_status || r?.status);
    return s === "paid" || s === "success" || s === "completed";
  });

  const paidAmount = Number(payload?.paid_amount || 0);
  return hasPaidRow || paidAmount > 0;
}

function derivePendingStatus(payload: any): InternalStatus {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  if (rows.length > 0) return "processing";
  return "pending";
}

function safeStatusForOrder(status: string): InternalStatus {
  const allowed: InternalStatus[] = [
    "pending",
    "processing",
    "paid",
    "expired",
    "failed",
    "cancelled",
  ];
  return allowed.includes(status as InternalStatus)
    ? (status as InternalStatus)
    : "pending";
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

    await connectToDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (String(order.qpayInvoiceId) !== invoiceId) {
      return NextResponse.json(
        { error: "Invoice does not match order" },
        { status: 400 },
      );
    }

    // Fast return for terminal statuses
    if (order.status === "paid") {
      return NextResponse.json(
        {
          paid: true,
          status: "paid",
          paidAmount: Number(order.paidAmount ?? order.amount ?? 0),
          orderId: order._id.toString(),
          invoiceId: String(order.qpayInvoiceId),
        },
        { status: 200 },
      );
    }

    if (order.status === "expired" || order.status === "cancelled") {
      return NextResponse.json(
        {
          paid: false,
          status: order.status,
          paidAmount: 0,
          orderId: order._id.toString(),
          invoiceId: String(order.qpayInvoiceId),
        },
        { status: 200 },
      );
    }

    const paymentStatus = await checkQPayPayment(invoiceId);
    const paid = isPaidFromPayload(paymentStatus);

    if (!paid) {
      const nextStatus = safeStatusForOrder(derivePendingStatus(paymentStatus));

      // Only update if changed and not terminal
      if (order.status !== "paid" && order.status !== nextStatus) {
        order.status = nextStatus;
        (order as any).qpayRawCheck = paymentStatus;
        await order.save();
      }

      return NextResponse.json(
        {
          paid: false,
          status: order.status === "paid" ? "paid" : nextStatus,
          paidAmount: 0,
          orderId: order._id.toString(),
          invoiceId: String(order.qpayInvoiceId),
        },
        { status: 200 },
      );
    }

    // Paid path — atomic stock decrement safety:
    // 1) atomically transition pending/processing -> paid
    // 2) decrement stock only if transition happened in this request
    const paidAmount =
      Number(paymentStatus?.paid_amount) ||
      Number(
        Array.isArray(paymentStatus?.rows)
          ? paymentStatus.rows?.[0]?.paid_amount
          : 0,
      ) ||
      Number(order.amount) ||
      0;

    const now = new Date();

    const transitioned = await Order.findOneAndUpdate(
      {
        _id: order._id,
        status: { $in: ["pending", "processing"] },
      },
      {
        $set: {
          status: "paid",
          paidAt: now,
          paidAmount,
          qpayRawCheck: paymentStatus,
        },
      },
      { new: true },
    );

    if (transitioned) {
      // Decrement stock only once, and only if stock is available
      await ShoppingItem.updateOne(
        { _id: transitioned.itemId, stock: { $gt: 0 } },
        { $inc: { stock: -1 } },
      );
    }

    const finalOrder = transitioned ?? order;

    return NextResponse.json(
      {
        paid: true,
        status: "paid",
        paidAmount: Number(finalOrder.paidAmount ?? paidAmount),
        orderId: finalOrder._id.toString(),
        invoiceId: String(finalOrder.qpayInvoiceId),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("QPay check-payment error:", error);
    return NextResponse.json(
      {
        error: "Failed to check QPay payment status",
        detail: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
