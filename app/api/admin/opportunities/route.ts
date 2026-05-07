import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Opportunity from "@/lib/models/Opportunity";
import { v2 as cloudinary } from 'cloudinary';
import { withAdminAuth } from "@/lib/adminAuth";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const GET = withAdminAuth(async () => {
  try {
    await connectToDB();
    const opportunities = await Opportunity.find({}).sort({ createdAt: -1 });
    return NextResponse.json(opportunities, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch opportunities", error);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (request: Request) => {
  try {
    await connectToDB();
    let data: any;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        data = await request.json();
    } else {
        const formData = await request.formData();
        data = {
            type: formData.get("type") || 'volunteer',
            title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
            provider: { en: formData.get("providerEn"), mn: formData.get("providerMn") },
            location: { en: formData.get("locEn"), mn: formData.get("locMn") },
            description: { en: formData.get("descEn"), mn: formData.get("descMn") },
            deadline: formData.get("deadline"),
            link: formData.get("link") || "#",
            tags: (formData.get("tags") as string || "").split(',').map(t => t.trim()),
            requirements: {
                en: (formData.get("reqEn") as string || "").split('\n').filter(r => r.trim()),
                mn: (formData.get("reqMn") as string || "").split('\n').filter(r => r.trim())
            },
            image: ""
        };
        const imageFile = formData.get("image") as File | null;
        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadResult = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'unicef_opportunities' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
            data.image = uploadResult.secure_url;
        }
    }

    const newOpp = await Opportunity.create(data);
    return NextResponse.json(newOpp, { status: 201 });
  } catch (error) {
    console.error("Failed to create opportunity", error);
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (request: Request) => {
    try {
        await connectToDB();
        let data: any;
        let id: string;
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            data = await request.json();
            id = data.id || data._id;
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
                tags: (formData.get("tags") as string || "").split(',').map(t => t.trim()),
                requirements: {
                    en: (formData.get("reqEn") as string || "").split('\n').filter(r => r.trim()),
                    mn: (formData.get("reqMn") as string || "").split('\n').filter(r => r.trim())
                },
            };
            const imageFile = formData.get("image") as File | null;
            if (imageFile && imageFile instanceof File) {
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const uploadResult = await new Promise<any>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'unicef_opportunities' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });
                data.image = uploadResult.secure_url;
            }
        }

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const updatedOpp = await Opportunity.findByIdAndUpdate(id, data, { new: true });
        return NextResponse.json(updatedOpp, { status: 200 });
    } catch (error) {
        console.error("Failed to update opportunity", error);
        return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 });
    }
});

export const DELETE = withAdminAuth(async (request: Request) => {
    try {
        await connectToDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await Opportunity.findByIdAndDelete(id);
        return NextResponse.json({ message: "Deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
});
