import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, toApiList, toDb } from "@/lib/supabase/mappers";
import { withAdminAuth } from "@/lib/adminAuth";
import { sendMaterialEmail } from "@/lib/email";

export const GET = withAdminAuth(async (_req: Request) => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }

  return NextResponse.json({ materials: toApiList(data) });
});

export const POST = withAdminAuth(async (req: Request) => {
  const body = await req.json();
  const { title, description, fileUrl, fileName, fileType, category, isForAll, sentTo } =
    body;

  if (!title || !fileUrl || !fileName) {
    return NextResponse.json(
      { error: "title, fileUrl and fileName are required" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from("materials")
    .insert(
      toDb({
        title,
        description: description || "",
        fileUrl,
        fileName,
        fileType: fileType || "other",
        category: category || "other",
        sentBy: "admin",
        sentTo: isForAll ? [] : sentTo || [],
        isForAll: !!isForAll,
      }),
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create material" }, { status: 500 });
  }

  const material = toApi(row)!;

  try {
    if (isForAll) {
      const { data: allUsers } = await supabase
        .from("users")
        .select("email, full_name")
        .neq("role", "admin");

      await Promise.allSettled(
        (allUsers ?? []).map((u) =>
          sendMaterialEmail(u.email, u.full_name || "Member", material),
        ),
      );
    } else if (sentTo?.length > 0) {
      const { data: targets } = await supabase
        .from("users")
        .select("email, full_name")
        .in("id", sentTo);

      await Promise.allSettled(
        (targets ?? []).map((u) =>
          sendMaterialEmail(u.email, u.full_name || "Member", material),
        ),
      );
    }
  } catch (emailErr) {
    console.error("Material email send error (non-fatal):", emailErr);
  }

  return NextResponse.json({ material }, { status: 201 });
});

export const DELETE = withAdminAuth(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
