import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    // 1. Connect DB
    await connectToDB();

    // 2. Check Auth
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Parse Body
    const body = await req.json();
    
    const { fullName, studentId, university } = body;

    // 4. Database Operation
    
    const user = await User.findOneAndUpdate(
      { clerkId: clerkUser.id },
      {
        $set: {
          email: clerkUser.emailAddresses[0].emailAddress,
          studentId: studentId ? studentId.toUpperCase() : "NO-ID",
          fullName: fullName || "New User",
          university: university || "MNUMS",
        },
        $setOnInsert: {
          clerkId: clerkUser.id,
          role: "guest",
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, user }, { status: 200 });

  } catch (error: any) {
    console.error("!!!!! SYNC FAILED !!!!!");
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}