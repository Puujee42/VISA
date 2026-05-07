import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { clerkId, email, fullName } = await req.json();

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert the user. Only set role to 'guest' if it's a new document.
    const user = await User.findOneAndUpdate(
      { clerkId },
      { 
        $set: { email, fullName },
        $setOnInsert: { role: 'guest' }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}