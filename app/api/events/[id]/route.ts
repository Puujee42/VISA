import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    const event = toApi(data);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const supabase = getSupabaseAdmin();

    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (userErr) throw userErr;
    const user = toApi(userRow);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: eventRow, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();

    if (eventErr) throw eventErr;
    const event = toApi(eventRow);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from("event_attendees")
      .select("user_id")
      .eq("event_id", eventId)
      .eq("user_id", user._id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }

    const { error: joinErr } = await supabase
      .from("event_attendees")
      .insert({ event_id: eventId, user_id: user._id });

    if (joinErr) throw joinErr;

    const title = (event.title as { en?: string })?.en ?? "Event";
    const activityHistory = [
      ...(Array.isArray(user.activityHistory) ? user.activityHistory : []),
      {
        type: "Event",
        title,
        date: new Date().toISOString(),
        points: 10,
        status: "pending",
      },
    ];

    const { error: updateErr } = await supabase
      .from("users")
      .update({
        activity_history: activityHistory,
        events_attended_count: (user.eventsAttendedCount ?? 0) + 1,
      })
      .eq("id", user._id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, message: "Successfully joined event" }, { status: 200 });
  } catch (error) {
    console.error("Error joining event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
