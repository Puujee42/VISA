import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApiList } from "@/lib/supabase/mappers";

export async function GET(_req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", session.id)
    .maybeSingle();

  if (!userRow) {
    return NextResponse.json({ materials: [] });
  }

  const userId = userRow.id;

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .or(`is_for_all.eq.true,sent_to.cs.{${userId}}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ materials: toApiList(data) });
}
