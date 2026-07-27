import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, toApiList, toDb } from "@/lib/supabase/mappers";
import { withSupabaseTimeout } from "@/lib/supabase/timeout";
import { withAdminAuth } from "@/lib/adminAuth";

export const revalidate = 60;

const emptyEvents = () =>
  NextResponse.json([], {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
    },
  });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const supabase = getSupabaseAdmin();
    let query = supabase.from("events").select("*").order("date", { ascending: true });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await withSupabaseTimeout(query);
    if (error) {
      console.error("[GET /api/events]", error.message);
      return emptyEvents();
    }

    return NextResponse.json(toApiList(data), {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("[GET /api/events] Failed to fetch events:", error);
    return emptyEvents();
  }
}

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();

    let title = body.title;
    if (typeof title === "string") {
      title = { en: title.trim(), mn: title.trim() };
    } else if (title && typeof title === "object") {
      title = {
        en: typeof title.en === "string" ? title.en.trim() : "",
        mn: typeof title.mn === "string" ? title.mn.trim() : "",
      };
    }

    let location = body.location;
    if (typeof location === "string") {
      location = { en: location.trim(), mn: location.trim() };
    } else if (location && typeof location === "object") {
      location = {
        en: typeof location.en === "string" ? location.en.trim() : "",
        mn: typeof location.mn === "string" ? location.mn.trim() : "",
      };
    }

    const category = typeof body.category === "string" ? body.category.trim() : "";
    const dateInput = typeof body.date === "string" ? body.date.trim() : body.date;

    if (!title?.en || !title?.mn) {
      return NextResponse.json({ error: "Title is required (both EN and MN)" }, { status: 400 });
    }
    if (!location?.en || !location?.mn) {
      return NextResponse.json({ error: "Location is required (both EN and MN)" }, { status: 400 });
    }
    if (!dateInput) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const eventDate = new Date(dateInput);
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const allowedCategories = ["campaign", "workshop", "fundraiser", "meeting"];
    if (!allowedCategories.includes(category)) {
      return NextResponse.json({
        error: `Invalid category. Allowed values: ${allowedCategories.join(", ")}`,
      }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("events")
      .insert(
        toDb({
          ...body,
          title,
          location,
          category,
          date: eventDate.toISOString(),
        }),
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toApi(data), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
});
