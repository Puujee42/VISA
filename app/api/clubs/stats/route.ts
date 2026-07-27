import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApiList } from "@/lib/supabase/mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const [{ data: users, error: usersErr }, { data: events, error: eventsErr }] =
      await Promise.all([
        supabase.from("users").select("university"),
        supabase.from("events").select("university, status, title, category, date"),
      ]);

    if (usersErr) throw usersErr;
    if (eventsErr) throw eventsErr;

    const clubData: Record<string, {
      members: number;
      activity: string;
      currentEvents: string[];
      pastEventsCount: number;
      totalEvents: number;
    }> = {};

    for (const row of users ?? []) {
      const uniId = row.university || "MNUMS";
      if (!clubData[uniId]) {
        clubData[uniId] = { members: 0, activity: "medium", currentEvents: [], pastEventsCount: 0, totalEvents: 0 };
      }
      clubData[uniId].members += 1;
    }

    for (const ev of toApiList(events ?? [])) {
      const uniId = (ev.university as string) || "MNUMS";
      if (!clubData[uniId]) {
        clubData[uniId] = { members: 0, activity: "inactive", currentEvents: [], pastEventsCount: 0, totalEvents: 0 };
      }

      clubData[uniId].totalEvents += 1;

      if (ev.status === "upcoming") {
        const titleObj = ev.title as { en?: string; mn?: string } | undefined;
        const title = titleObj?.en || titleObj?.mn || "Untitled Event";
        clubData[uniId].currentEvents.push(title);
      } else if (ev.status === "past" || ev.status === "completed") {
        clubData[uniId].pastEventsCount += 1;
      }
    }

    for (const key of Object.keys(clubData)) {
      const data = clubData[key];
      data.currentEvents = data.currentEvents.slice(0, 3);

      const score = data.members + data.totalEvents * 5;
      if (score > 100) data.activity = "very high";
      else if (score > 50) data.activity = "high";
      else if (score > 10) data.activity = "medium";
      else data.activity = "low";

      if (data.members === 0 && data.totalEvents === 0) data.activity = "inactive";
    }

    return NextResponse.json(clubData, { status: 200 });
  } catch (error) {
    console.error("Error fetching club stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
