import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, withAttendees } from "@/lib/supabase/mappers";
import { CACHE_TIMES, createCacheHeaders } from "@/lib/cache-config";

export const revalidate = 60;

async function loadLessonWithAttendees(supabase: ReturnType<typeof getSupabaseAdmin>, lessonId: string) {
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();

  if (error) throw error;
  if (!lesson) return null;

  const { data: links } = await supabase
    .from("lesson_attendees")
    .select("user_id")
    .eq("lesson_id", lessonId);

  const userIds = (links ?? []).map((l) => l.user_id);
  if (userIds.length === 0) {
    return { ...toApi(lesson)!, attendees: [] };
  }

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, photo")
    .in("id", userIds);

  return withAttendees(lesson, users ?? []);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const country = searchParams.get("country");
    const supabase = getSupabaseAdmin();

    if (id) {
      const lesson = await loadLessonWithAttendees(supabase, id);
      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }
      return NextResponse.json(lesson, { headers: createCacheHeaders(300) });
    }

    let query = supabase
      .from("lessons")
      .select("*")
      .neq("status", "archived")
      .order("created_at", { ascending: false });

    if (country) {
      query = query.eq("country_tag", country);
    }

    const { data: lessons, error } = await query;
    if (error) throw error;

    const withAttendeesList = await Promise.all(
      (lessons ?? []).map(async (lesson) => {
        const { data: links } = await supabase
          .from("lesson_attendees")
          .select("user_id")
          .eq("lesson_id", lesson.id);

        const userIds = (links ?? []).map((l) => l.user_id);
        if (!userIds.length) return { ...toApi(lesson)!, attendees: [] };

        const { data: users } = await supabase
          .from("users")
          .select("id, full_name, photo")
          .in("id", userIds);

        return withAttendees(lesson, users ?? []);
      }),
    );

    return NextResponse.json(withAttendeesList, {
      headers: createCacheHeaders(CACHE_TIMES.dynamic),
    });
  } catch (error) {
    console.error("Failed to fetch lessons", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authId = await getUserId();
    if (!authId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", authId)
      .maybeSingle();

    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { lessonId } = await req.json();
    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("lesson_attendees")
      .select("user_id")
      .eq("lesson_id", lessonId)
      .eq("user_id", userRow.id)
      .maybeSingle();

    const lesson = await loadLessonWithAttendees(supabase, lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (existing) {
      return NextResponse.json({ message: "Already registered", lesson }, { status: 200 });
    }

    await supabase
      .from("lesson_attendees")
      .insert({ lesson_id: lessonId, user_id: userRow.id });

    const updated = await loadLessonWithAttendees(supabase, lessonId);
    return NextResponse.json({ message: "Registered successfully", lesson: updated }, { status: 200 });
  } catch (error) {
    console.error("Lesson registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authId = await getUserId();
    if (!authId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", authId)
      .maybeSingle();

    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    let lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      try {
        const body = await req.json();
        lessonId = body.lessonId;
      } catch {
        // skip
      }
    }

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
    }

    await supabase
      .from("lesson_attendees")
      .delete()
      .eq("lesson_id", lessonId)
      .eq("user_id", userRow.id);

    const lesson = await loadLessonWithAttendees(supabase, lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Unregistered successfully", lesson }, { status: 200 });
  } catch (error) {
    console.error("Lesson unregistration error:", error);
    return NextResponse.json({ error: "Unregistration failed" }, { status: 500 });
  }
}
