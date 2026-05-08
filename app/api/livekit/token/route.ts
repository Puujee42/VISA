import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { AccessToken } from "livekit-server-sdk";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import Booking from "@/lib/models/Booking";

export async function GET(req: Request) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse query params
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");
    let identity = searchParams.get("identity");

    if (!room) {
      return NextResponse.json({ error: "Missing 'room' parameter" }, { status: 400 });
    }

    if (!identity) {
      identity = clerkUser.firstName 
        ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() 
        : clerkUser.id;
    }

    // 3. Connect DB and check authorization
    await connectToDB();
    
    // Check if user is admin
    const dbUser = await User.findOne({ clerkId: userId }).lean();
    const isAdmin = dbUser?.role === "admin";

    // If not admin, verify ownership of the booking
    if (!isAdmin) {
      const booking = await Booking.findOne({ livekitRoom: room }).lean();
      
      if (!booking) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }

      if (booking.userId !== userId) {
        return NextResponse.json({ error: "Forbidden: You do not have permission to join this room" }, { status: 403 });
      }
    }

    // 4. Generate token
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("LiveKit credentials are not configured.");
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
    });

    at.addGrant({ roomJoin: true, room });

    const token = await at.toJwt();

    return NextResponse.json({ token });

  } catch (error) {
    console.error("LiveKit token generation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
