import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { getSessionUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");
    let identity = searchParams.get("identity");

    if (!room) {
      return NextResponse.json({ error: "Missing 'room' parameter" }, { status: 400 });
    }

    if (!identity) {
      identity = session.fullName || session.email || session.id;
    }

    const supabase = getSupabaseAdmin();
    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", session.id)
      .maybeSingle();

    const dbUser = toApi(userRow);
    const isAdmin = dbUser?.role === "admin";

    if (!isAdmin) {
      const { data: bookingRow } = await supabase
        .from("bookings")
        .select("user_id")
        .eq("livekit_room", room)
        .maybeSingle();

      if (!bookingRow) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }
      if (bookingRow.user_id !== session.id) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to join this room" },
          { status: 403 },
        );
      }
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, { identity });
    at.addGrant({ roomJoin: true, room });
    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (error) {
    console.error("LiveKit token generation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
