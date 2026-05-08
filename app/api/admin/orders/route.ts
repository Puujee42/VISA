import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import ShoppingItem from "@/lib/models/ShoppingItem";
import { withAdminAuth } from "@/lib/adminAuth";

export const GET = withAdminAuth(async () => {
  try {
    await connectToDB();
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("itemId", "name price");
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const validStatuses = ["pending", "processing", "paid", "expired", "failed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const wasPaid = order.status === "paid";

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status, ...(status === "paid" ? { paidAt: new Date() } : {}) },
      { new: true }
    );
    if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (status === "paid" && !wasPaid) {
      await ShoppingItem.updateOne(
        { _id: updated.itemId, stock: { $gte: updated.quantity } },
        { $inc: { stock: -updated.quantity } }
      );
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await Order.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
});
