import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApiList } from "@/lib/supabase/mappers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const [{ count: memberCount, error: countErr }, { data: events, error: eventsErr }] =
      await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }).eq("university", id),
        supabase.from("events").select("*").eq("university", id).order("date", { ascending: false }),
      ]);

    if (countErr) throw countErr;
    if (eventsErr) throw eventsErr;

    const apiEvents = toApiList(events ?? []);
    const totalEvents = apiEvents.length;
    const pastEventsCount = apiEvents.filter(
      (e) => e.status === "past" || e.status === "completed",
    ).length;

    const members = memberCount ?? 0;
    const score = members + totalEvents * 5;
    let activityLevel = "low";
    if (score > 100) activityLevel = "very high";
    else if (score > 50) activityLevel = "high";
    else if (score > 10) activityLevel = "medium";
    if (members === 0 && totalEvents === 0) activityLevel = "inactive";

    const now = new Date();
    const upcomingEvents = apiEvents
      .filter((e) => e.status === "upcoming" && new Date(e.date as string) >= now)
      .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());

    const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

    return NextResponse.json({
      id,
      stats: {
        members,
        totalEvents,
        pastEventsCount,
        activity: activityLevel,
      },
      nextEvent,
      events: apiEvents,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching club details:", error);
    return NextResponse.json({ error: "Failed to fetch club details" }, { status: 500 });
  }
}
