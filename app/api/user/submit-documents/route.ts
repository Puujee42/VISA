import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documents } = await req.json();
    if (!documents) {
      return NextResponse.json({ error: "No documents provided" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .update({ documents, documents_submitted: true })
      .eq("clerk_id", userId)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Documents submitted successfully" });
  } catch (error) {
    console.error("Submit documents error:", error);
    return NextResponse.json({ error: "Failed to submit documents" }, { status: 500 });
  }
}
