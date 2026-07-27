import { NextResponse } from "next/server";
import { getSessionUser, getUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, toApiList } from "@/lib/supabase/mappers";
import { sendBookingRequestEmail } from "@/lib/email";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(toApiList(data), { status: 200 });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const { service, date, time, name, email, phone, note } = body;

    if (!service || !date || !time || !name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: session?.id || "guest",
        service_id: service.id,
        service_title: service.title,
        date: date.full,
        time,
        name,
        email,
        phone,
        note,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    const booking = toApi(data)!;
    await supabase
      .from("bookings")
      .update({ livekit_room: `room_${booking._id}` })
      .eq("id", booking._id);

    booking.livekitRoom = `room_${booking._id}`;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendBookingRequestEmail(adminEmail, {
        serviceTitle: service.title,
        date: date.full,
        time,
        name,
        email,
        phone,
        note,
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
