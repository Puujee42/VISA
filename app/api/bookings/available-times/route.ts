import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BASE_TIMES = [
  "10:00", "10:10", "11:00", "13:00",
  "14:00", "15:30", "16:30", "18:00",
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bookings")
      .select("time")
      .eq("date", date)
      .in("status", ["pending", "confirmed"]);

    if (error) throw error;

    const takenTimes = (data ?? []).map((b) => b.time);
    const availableTimes = BASE_TIMES.filter((time) => !takenTimes.includes(time));

    return NextResponse.json({ availableTimes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching available times:", error);
    return NextResponse.json({ error: "Failed to fetch times" }, { status: 500 });
  }
}
