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
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(toApiList(data), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch opportunities", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 },
    );
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
        type: formData.get("type") || "volunteer",
        title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
        provider: { en: formData.get("providerEn"), mn: formData.get("providerMn") },
        location: { en: formData.get("locEn"), mn: formData.get("locMn") },
        description: { en: formData.get("descEn"), mn: formData.get("descMn") },
        deadline: formData.get("deadline"),
        link: formData.get("link") || "#",
        tags: ((formData.get("tags") as string) || "")
          .split(",")
          .map((t) => t.trim()),
        requirements: {
          en: ((formData.get("reqEn") as string) || "")
            .split("\n")
            .filter((r) => r.trim()),
          mn: ((formData.get("reqMn") as string) || "")
            .split("\n")
            .filter((r) => r.trim()),
        },
        image: "",
      };
      const imageFile = formData.get("image") as File | null;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "unicef_opportunities" },
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
      .from("opportunities")
      .insert(toDb(data))
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toApi(row), { status: 201 });
  } catch (error) {
    console.error("Failed to create opportunity", error);
    return NextResponse.json(
      { error: "Failed to create opportunity" },
      { status: 500 },
    );
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
      delete data.id;
      delete data._id;
    } else {
      const formData = await request.formData();
      id = formData.get("id") as string;
      data = {
        type: formData.get("type"),
        title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
        provider: { en: formData.get("providerEn"), mn: formData.get("providerMn") },
        location: { en: formData.get("locEn"), mn: formData.get("locMn") },
        description: { en: formData.get("descEn"), mn: formData.get("descMn") },
        deadline: formData.get("deadline"),
        link: formData.get("link"),
        tags: ((formData.get("tags") as string) || "")
          .split(",")
          .map((t) => t.trim()),
        requirements: {
          en: ((formData.get("reqEn") as string) || "")
            .split("\n")
            .filter((r) => r.trim()),
          mn: ((formData.get("reqMn") as string) || "")
            .split("\n")
            .filter((r) => r.trim()),
        },
      };
      const imageFile = formData.get("image") as File | null;
      if (imageFile && imageFile instanceof File) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "unicef_opportunities" },
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
      .from("opportunities")
      .update(toDb(data))
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    return NextResponse.json(toApi(row), { status: 200 });
  } catch (error) {
    console.error("Failed to update opportunity", error);
    return NextResponse.json(
      { error: "Failed to update opportunity" },
      { status: 500 },
    );
  }
});

export const DELETE = withAdminAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("opportunities").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
});
