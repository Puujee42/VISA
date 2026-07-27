import { NextResponse } from "next/server";
import { getSessionUser, ensureUserProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";

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
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", session.id)
      .maybeSingle();

    if (error) throw error;
    let user = toApi(data);

    if (!user) {
      user = await ensureUserProfile({
        id: session.id,
        email: session.email || "",
        fullName: session.fullName,
      });
      return NextResponse.json({
        user: formatUserPayload(user),
        activity: [],
        isNewUser: true,
      });
    }

    return NextResponse.json({
      user: formatUserPayload(user),
      activity: user.activityHistory || [],
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
