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
      .from("clubs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(toApiList(data), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch clubs", error);
    return NextResponse.json({ error: "Failed to fetch clubs" }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (request: Request) => {
  try {
    const formData = await request.formData();

    const clubId = formData.get("clubId") as string;
    const nameEn = formData.get("nameEn") as string;
    const nameMn = formData.get("nameMn") as string;
    const descEn = formData.get("descEn") as string;
    const descMn = formData.get("descMn") as string;
    const website = formData.get("website") as string;
    const email = formData.get("email") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = "";
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "unicef_clubs" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string });
            },
          );
          uploadStream.end(buffer);
        },
      );
      imageUrl = uploadResult.secure_url;
    }

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("clubs")
      .insert(
        toDb({
          clubId,
          name: { en: nameEn, mn: nameMn },
          description: { en: descEn, mn: descMn },
          website,
          email,
          image: imageUrl,
        }),
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toApi(row), { status: 201 });
  } catch (error) {
    console.error("Failed to create club", error);
    return NextResponse.json({ error: "Failed to create club" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (request: Request) => {
  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const clubId = formData.get("clubId") as string;
    const nameEn = formData.get("nameEn") as string;
    const nameMn = formData.get("nameMn") as string;
    const descEn = formData.get("descEn") as string;
    const descMn = formData.get("descMn") as string;
    const website = formData.get("website") as string;
    const email = formData.get("email") as string;
    const imageFile = formData.get("image") as File;

    const updateData: Record<string, unknown> = {
      clubId,
      name: { en: nameEn, mn: nameMn },
      description: { en: descEn, mn: descMn },
      website,
      email,
    };

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "unicef_clubs" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string });
            },
          );
          uploadStream.end(buffer);
        },
      );
      updateData.image = uploadResult.secure_url;
    }

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("clubs")
      .update(toDb(updateData))
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json(toApi(row), { status: 200 });
  } catch (error) {
    console.error("Failed to update club", error);
    return NextResponse.json({ error: "Failed to update club" }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("clubs").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
});
