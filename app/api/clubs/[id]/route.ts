import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import Event from "@/lib/models/Events";

export const dynamic = 'force-dynamic';

interface EventDocument {
  status: string;
  date: Date | string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDB();

    // 1. Get Member Count
    const memberCount = await User.countDocuments({ university: id });

    // 2. Get Events for this university
    const events = await Event.find({ university: id }).sort({ date: -1 }); // Sort by date descending (newest first)

    // 3. Calculate Stats
    const totalEvents = events.length;
    const pastEventsCount = events.filter((e: EventDocument) => e.status === 'past' || e.status === 'completed').length;
    
    // Activity Score Calculation (Consistent with clubs/stats/route.ts)
    // Logic: Members * 1 + Total Events * 5
    const score = memberCount + (totalEvents * 5);
    let activityLevel = "low";
    
    if (score > 100) activityLevel = "very high";
    else if (score > 50) activityLevel = "high";
    else if (score > 10) activityLevel = "medium";
    
    // If no members and no events, inactive
    if (memberCount === 0 && totalEvents === 0) activityLevel = "inactive";

    // 4. Find Next Upcoming Event
    // We can filter the 'events' array we already fetched since it's likely small, 
    // or run a specific query if optimizing. Given the scale, filtering is fine.
    // We want the *earliest* upcoming event.
    const upcomingEvents = events
      .filter((e: EventDocument) => e.status === 'upcoming' && new Date(e.date) >= new Date())
      .sort((a: EventDocument, b: EventDocument) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

    return NextResponse.json({
      id,
      stats: {
        members: memberCount,
        totalEvents,
        pastEventsCount,
        activity: activityLevel
      },
      nextEvent,
      events
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching club details:", error);
    return NextResponse.json({ error: "Failed to fetch club details" }, { status: 500 });
  }
}
