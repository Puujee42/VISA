import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, toApiList, toDb } from "@/lib/supabase/mappers";
import { withSupabaseTimeout } from "@/lib/supabase/timeout";

export const GET = withAdminAuth(async () => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("apply_questions")
        .select("*")
        .order("sort_order", { ascending: true }),
    );
    if (error) throw error;
    return NextResponse.json(toApiList(data || []));
  } catch (error) {
    console.error("[admin/apply-questions GET]", error);
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const fieldKey = String(body.fieldKey || body.field_key || "")
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();

    if (!fieldKey) {
      return NextResponse.json({ error: "fieldKey required" }, { status: 400 });
    }

    const label =
      typeof body.label === "object"
        ? body.label
        : { en: String(body.label || fieldKey), mn: String(body.label || fieldKey), de: String(body.label || fieldKey) };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("apply_questions")
      .insert(
        toDb({
          fieldKey,
          label,
          type: body.type || "text",
          options: body.options || [],
          required: body.required !== false,
          sortOrder: Number(body.sortOrder ?? body.sort_order ?? 100),
          isActive: body.isActive !== false,
          isSystem: false,
          placeholder: body.placeholder || { en: "", mn: "", de: "" },
        }),
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toApi(data), { status: 201 });
  } catch (error) {
    console.error("[admin/apply-questions POST]", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (body.label !== undefined) patch.label = body.label;
    if (body.type !== undefined) patch.type = body.type;
    if (body.options !== undefined) patch.options = body.options;
    if (body.required !== undefined) patch.required = body.required;
    if (body.sortOrder !== undefined || body.sort_order !== undefined) {
      patch.sort_order = Number(body.sortOrder ?? body.sort_order);
    }
    if (body.isActive !== undefined || body.is_active !== undefined) {
      patch.is_active = body.isActive ?? body.is_active;
    }
    if (body.placeholder !== undefined) patch.placeholder = body.placeholder;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("apply_questions")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toApi(data));
  } catch (error) {
    console.error("[admin/apply-questions PUT]", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: row } = await supabase
      .from("apply_questions")
      .select("is_system")
      .eq("id", id)
      .maybeSingle();

    if (row?.is_system) {
      return NextResponse.json(
        { error: "Системийн асуултыг устгах боломжгүй. Идэвхгүй болгоно уу." },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("apply_questions").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/apply-questions DELETE]", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
});
