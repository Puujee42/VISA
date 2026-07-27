import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, toApiList, toDb, withAttendees } from "@/lib/supabase/mappers";
import { v2 as cloudinary } from "cloudinary";
import { withAdminAuth } from "@/lib/adminAuth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function loadEventsWithAttendees() {
  const supabase = getSupabaseAdmin();
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  if (!events?.length) return [];

  const eventIds = events.map((e) => e.id);
  const { data: links } = await supabase
    .from("event_attendees")
    .select("event_id, user_id")
    .in("event_id", eventIds);

  const userIds = [...new Set((links ?? []).map((l) => l.user_id))];
  const { data: users } = userIds.length
    ? await supabase
        .from("users")
        .select("id, full_name, photo")
        .in("id", userIds)
    : { data: [] as { id: string; full_name?: string; photo?: string }[] };

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u]));
  const attendeesByEvent: Record<
    string,
    { id: string; full_name?: string; photo?: string }[]
  > = {};

  for (const link of links ?? []) {
    if (!attendeesByEvent[link.event_id]) attendeesByEvent[link.event_id] = [];
    const user = userMap[link.user_id];
    if (user) attendeesByEvent[link.event_id].push(user);
  }

  return events.map((event) =>
    withAttendees(event, attendeesByEvent[event.id] ?? []),
  );
}

export const GET = withAdminAuth(async () => {
  try {
    const events = await loadEventsWithAttendees();
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (req: Request) => {
  try {
    let data: Record<string, unknown>;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await req.json();
    } else {
      const formData = await req.formData();
      data = {
        title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
        description: { en: formData.get("descEn"), mn: formData.get("descMn") },
        date: formData.get("date"),
        timeString: formData.get("timeString") || "All Day",
        location: { en: formData.get("locEn"), mn: formData.get("locMn") },
        category: formData.get("category") || "workshop",
        image: "",
      };
      const imageFile = formData.get("image") as File | null;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileBase64 = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
        const uploadRes = await cloudinary.uploader.upload(fileBase64, {
          folder: "unicef_club_events",
        });
        data.image = uploadRes.secure_url;
      }
    }

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("events")
      .insert(
        toDb({
          ...data,
          university: (data.university as string) || "MNUMS",
          status: (data.status as string) || "upcoming",
        }),
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toApi(row), { status: 201 });
  } catch (error: unknown) {
    console.error("Event Create Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    let data: Record<string, unknown>;
    let id: string;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await req.json();
      id = (data.id || data._id) as string;
      if (data.image === "") delete data.image;
      delete data.id;
      delete data._id;
      delete data.attendees;
    } else {
      const formData = await req.formData();
      id = formData.get("id") as string;
      data = {
        title: { en: formData.get("titleEn"), mn: formData.get("titleMn") },
        description: { en: formData.get("descEn"), mn: formData.get("descMn") },
        date: formData.get("date"),
        timeString: formData.get("timeString"),
        location: { en: formData.get("locEn"), mn: formData.get("locMn") },
        category: formData.get("category"),
      };
      const imageFile = formData.get("image");
      if (imageFile && imageFile instanceof File) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileBase64 = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
        const uploadRes = await cloudinary.uploader.upload(fileBase64, {
          folder: "unicef_club_events",
        });
        data.image = uploadRes.secure_url;
      }
    }

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("events")
      .update(toDb(data))
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(toApi(row), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
});
