import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, toApiList, toDb } from "@/lib/supabase/mappers";
import { withAdminAuth } from "@/lib/adminAuth";
import { sendBookingApprovedEmail, sendBookingRejectedEmail } from "@/lib/email";

export const GET = withAdminAuth(async () => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(toApiList(data), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    const { bookingId, status } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["confirmed", "rejected", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: bookingRow, error: fetchErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!bookingRow) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const { data: updatedRow, error: updateErr } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateErr) throw updateErr;
    const booking = toApi(updatedRow)!;

    if (status === "confirmed") {
      await sendBookingApprovedEmail(booking.email as string, {
        serviceTitle: booking.serviceTitle as string,
        date: booking.date as string,
        time: booking.time as string,
        name: booking.name as string,
        email: booking.email as string,
        phone: booking.phone as string,
        note: booking.note as string,
      });
    } else if (status === "rejected") {
      await sendBookingRejectedEmail(booking.email as string, {
        serviceTitle: booking.serviceTitle as string,
        date: booking.date as string,
        time: booking.time as string,
        name: booking.name as string,
        email: booking.email as string,
        phone: booking.phone as string,
        note: booking.note as string,
      });
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
});
