import { NextResponse } from "next/server";
import { getSessionUser, ensureUserProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi, toApiList } from "@/lib/supabase/mappers";

function formatUserPayload(user: ReturnType<typeof toApi>) {
  if (!user) return null;
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    country: user.country,
    step: user.step,
    badges: user.badges || [],
    points: user.points || 0,
    profile: user.profile || null,
  };
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const [userRes, bookingsRes, applicationsRes] = await Promise.all([
      supabase.from("users").select("*").eq("clerk_id", session.id).maybeSingle(),
      supabase.from("bookings").select("*").eq("user_id", session.id).order("created_at", { ascending: false }),
      supabase.from("applications").select("*").eq("user_id", session.id).order("created_at", { ascending: false }),
    ]);

    if (userRes.error) throw userRes.error;
    if (bookingsRes.error) throw bookingsRes.error;
    if (applicationsRes.error) throw applicationsRes.error;

    let user = toApi(userRes.data);
    const bookings = toApiList(bookingsRes.data);
    const applications = toApiList(applicationsRes.data);

    if (!user) {
      user = await ensureUserProfile({
        id: session.id,
        email: session.email || "",
        fullName: session.fullName,
      });
      return NextResponse.json({
        user: formatUserPayload(user),
        activity: [],
        bookings,
        applications,
        isNewUser: true,
      }, { status: 200 });
    }

    return NextResponse.json({
      user: formatUserPayload(user),
      activity: user.activityHistory || [],
      bookings,
      applications,
    }, { status: 200 });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
