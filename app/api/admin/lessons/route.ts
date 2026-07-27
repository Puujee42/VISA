import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, toDb, withAttendees } from "@/lib/supabase/mappers";
import { withAdminAuth } from "@/lib/adminAuth";

async function loadLessonsWithAttendees() {
  const supabase = getSupabaseAdmin();
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!lessons?.length) return [];

  const lessonIds = lessons.map((l) => l.id);
  const { data: links } = await supabase
    .from("lesson_attendees")
    .select("lesson_id, user_id")
    .in("lesson_id", lessonIds);

  const userIds = [...new Set((links ?? []).map((l) => l.user_id))];
  const { data: users } = userIds.length
    ? await supabase
        .from("users")
        .select("id, full_name, photo")
        .in("id", userIds)
    : { data: [] as { id: string; full_name?: string; photo?: string }[] };

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u]));
  const attendeesByLesson: Record<
    string,
    { id: string; full_name?: string; photo?: string }[]
  > = {};

  for (const link of links ?? []) {
    if (!attendeesByLesson[link.lesson_id]) attendeesByLesson[link.lesson_id] = [];
    const user = userMap[link.user_id];
    if (user) attendeesByLesson[link.lesson_id].push(user);
  }

  return lessons.map((lesson) =>
    withAttendees(lesson, attendeesByLesson[lesson.id] ?? []),
  );
}

export const GET = withAdminAuth(async () => {
  try {
    const lessons = await loadLessonsWithAttendees();
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("GET /api/admin/lessons error:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("lessons")
      .insert(toDb(body))
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toApi(data), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const { id, _id, ...updateData } = body;
    const lessonId = id || _id;

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("lessons")
      .update(toDb(updateData))
      .eq("id", lessonId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(toApi(data));
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
});
