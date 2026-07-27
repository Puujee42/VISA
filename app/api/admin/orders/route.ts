import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";
import { withAdminAuth } from "@/lib/adminAuth";

function populateItemId<T extends Record<string, unknown>>(
  order: T & { _id: string; itemId?: unknown },
  items: { id: string; name: unknown; price: unknown }[],
) {
  const item = items.find((i) => i.id === order.itemId);
  if (!item) return order;
  return {
    ...order,
    itemId: { _id: item.id, name: item.name, price: item.price },
  };
}

export const GET = withAdminAuth(async () => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const itemIds = [...new Set((orders ?? []).map((o) => o.item_id))];
    let items: { id: string; name: unknown; price: unknown }[] = [];
    if (itemIds.length) {
      const { data: itemRows, error: itemErr } = await supabase
        .from("shopping_items")
        .select("id, name, price")
        .in("id", itemIds);
      if (itemErr) throw itemErr;
      items = itemRows ?? [];
    }

    const populated = (orders ?? []).map((o) =>
      populateItemId(toApi(o)!, items),
    );

    return NextResponse.json(populated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const validStatuses = [
      "pending",
      "processing",
      "paid",
      "expired",
      "failed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: orderRow, error: fetchErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!orderRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const wasPaid = orderRow.status === "paid";
    const updatePayload: Record<string, unknown> = { status };
    if (status === "paid") {
      updatePayload.paid_at = new Date().toISOString();
    }

    const { data: updatedRow, error: updateErr } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select()
      .maybeSingle();

    if (updateErr) throw updateErr;
    if (!updatedRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status === "paid" && !wasPaid) {
      await supabase.rpc("decrement_stock", {
        p_item_id: updatedRow.item_id,
        p_quantity: updatedRow.quantity,
      });
    }

    return NextResponse.json(toApi(updatedRow), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
});
