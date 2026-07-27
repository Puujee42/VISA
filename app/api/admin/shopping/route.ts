import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, toApiList, toDb } from "@/lib/supabase/mappers";
import { withAdminAuth } from "@/lib/adminAuth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const GET = withAdminAuth(async () => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("shopping_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(toApiList(data), { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch shopping items" },
      { status: 500 },
    );
  }
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const data = await req.json();
    const supabase = getSupabaseAdmin();

    const { data: row, error } = await supabase
      .from("shopping_items")
      .insert(
        toDb({
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image || "",
          category: data.category || "general",
          stock: data.stock || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
        }),
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toApi(row), { status: 201 });
  } catch (error: unknown) {
    console.error("Shopping item create error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("shopping_items")
      .update(toDb(updateData))
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(toApi(row), { status: 200 });
  } catch (error: unknown) {
    console.error("Shopping item update error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("shopping_items").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
