import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, toApiList, toDb } from "@/lib/supabase/mappers";
import { v2 as cloudinary } from "cloudinary";
import { withAdminAuth } from "@/lib/adminAuth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const GET = withAdminAuth(async () => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("published_date", { ascending: false });

    if (error) throw error;
    return NextResponse.json(toApiList(data), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch news", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (request: Request) => {
  try {
    let data: Record<string, unknown>;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = {
        title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
        summary: { en: formData.get("summaryEn"), mn: formData.get("summaryMn") },
        content: { en: formData.get("contentEn"), mn: formData.get("contentMn") },
        author: formData.get("author") || "Admin",
        tags: ((formData.get("tags") as string) || "")
          .split(",")
          .map((t) => t.trim()),
        featured: formData.get("featured") === "true",
        status: formData.get("status") || "published",
        image: "",
      };
      const imageFile = formData.get("image") as File | null;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "unicef_news" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as { secure_url: string });
              },
            );
            uploadStream.end(buffer);
          },
        );
        data.image = uploadResult.secure_url;
      }
    }

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("news")
      .insert(toDb(data))
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toApi(row), { status: 201 });
  } catch (error) {
    console.error("Failed to create news", error);
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (request: Request) => {
  try {
    let data: Record<string, unknown>;
    let id: string;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await request.json();
      id = (data.id || data._id) as string;
      if (data.image === "") delete data.image;
      delete data.id;
      delete data._id;
    } else {
      const formData = await request.formData();
      id = formData.get("id") as string;
      data = {
        title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
        summary: { en: formData.get("summaryEn"), mn: formData.get("summaryMn") },
        content: { en: formData.get("contentEn"), mn: formData.get("contentMn") },
        author: formData.get("author"),
        tags: ((formData.get("tags") as string) || "")
          .split(",")
          .map((t) => t.trim()),
        featured: formData.get("featured") === "true",
        status: formData.get("status"),
      };
      const imageFile = formData.get("image") as File | null;
      if (imageFile && imageFile instanceof File) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "unicef_news" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as { secure_url: string });
              },
            );
            uploadStream.end(buffer);
          },
        );
        data.image = uploadResult.secure_url;
      }
    }

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("news")
      .update(toDb(data))
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(toApi(row), { status: 200 });
  } catch (error) {
    console.error("Failed to update news", error);
    return NextResponse.json({ error: "Failed to update news" }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
});
