import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Application from "@/lib/models/Application";
import User from "@/lib/models/User";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { userId: clerkId } = await auth();
    const data = await req.json();

    const {
      programId,
      firstName,
      lastName,
      email,
      phone,
      age,
      level,
      message,
    } = data;

    // Validation
    if (!programId || !firstName || !lastName || !email || !phone || !age || !level) {
      return NextResponse.json(
        { error: "Registration incomplete. Please fill all required fields." },
        { status: 400 }
      );
    }

    const application = await Application.create({
      programId,
      firstName,
      lastName,
      email,
      phone,
      age,
      level,
      message,
      userId: clerkId, // Store the clerkId directly for reliable lookup
      status: 'pending'
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error("Application creation error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}