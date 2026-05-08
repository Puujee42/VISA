import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import News from "@/lib/models/News";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDB();
    const article = await News.findOne({ _id: id, status: 'published' });

    if (!article) {
      return NextResponse.json({ error: "News article not found" }, { status: 404 });
    }

    return NextResponse.json(article, { status: 200 });
  } catch (error) {
    console.error("Error fetching news article:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
