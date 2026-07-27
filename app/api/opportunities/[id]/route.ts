import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    const opportunity = toApi(data);
    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    return NextResponse.json(opportunity, { status: 200 });
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
