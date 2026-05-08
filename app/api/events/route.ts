import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Event from "@/lib/models/Events";
import { withAdminAuth } from "@/lib/adminAuth";

export const revalidate = 60;

// GET: Fetch all events (with optional filtering)
export async function GET(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query = {};
    if (category && category !== 'all') {
      query = { category };
    }

    // Sort by date ascending (upcoming events first)
    const events = await Event.find(query).sort({ date: 1 });

    return NextResponse.json(events, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST: Create a new event (Protected: Members/Admins only)
export const POST = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();

    const body = await req.json();

    // 1. Trim and format string/object fields
    let title = body.title;
    if (typeof title === 'string') {
      title = { en: title.trim(), mn: title.trim() };
    } else if (title && typeof title === 'object') {
      title = {
        en: typeof title.en === 'string' ? title.en.trim() : '',
        mn: typeof title.mn === 'string' ? title.mn.trim() : ''
      };
    }

    let location = body.location;
    if (typeof location === 'string') {
      location = { en: location.trim(), mn: location.trim() };
    } else if (location && typeof location === 'object') {
      location = {
        en: typeof location.en === 'string' ? location.en.trim() : '',
        mn: typeof location.mn === 'string' ? location.mn.trim() : ''
      };
    }

    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const dateInput = typeof body.date === 'string' ? body.date.trim() : body.date;

    // 2. Check required fields
    if (!title || !title.en || !title.mn) {
      return NextResponse.json({ error: "Title is required (both EN and MN)" }, { status: 400 });
    }
    if (!location || !location.en || !location.mn) {
      return NextResponse.json({ error: "Location is required (both EN and MN)" }, { status: 400 });
    }
    if (!dateInput) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // 3. Validate Date (хүчинтэй огноо мөн эсэх)
    const eventDate = new Date(dateInput);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // 4. Validate Category (зөвшөөрөгдсөн утгууд)
    const allowedCategories = ['campaign', 'workshop', 'fundraiser', 'meeting'];
    if (!allowedCategories.includes(category)) {
      return NextResponse.json({
        error: `Invalid category. Allowed values: ${allowedCategories.join(', ')}`
      }, { status: 400 });
    }

    // Overwrite the body properties with cleaned and validated data
    const cleanedBody = {
      ...body,
      title,
      location,
      category,
      date: eventDate,
    };

    const newEvent = await Event.create(cleanedBody);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
})