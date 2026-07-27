import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApiList } from "@/lib/supabase/mappers";
import { withSupabaseTimeout } from "@/lib/supabase/timeout";

export const GET = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "1";

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (unreadOnly) query = query.eq("is_read", false);

    const { data, error } = await withSupabaseTimeout(query);
    if (error) throw error;

    const unread = (data || []).filter((n) => !n.is_read).length;
    return NextResponse.json({
      items: toApiList(data || []),
      unread,
    });
  } catch (error) {
    console.error("[admin/notifications GET]", error);
    return NextResponse.json({ items: [], unread: 0 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    if (body.markAll) {
      await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      return NextResponse.json({ ok: true });
    }

    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("id", body.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/notifications PUT]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});
