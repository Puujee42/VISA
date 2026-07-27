import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";
import { withAdminAuth } from "@/lib/adminAuth";

const PROGRAM_MAP: Record<string, string> = {
  DE: "Germany",
  BE: "Belgium",
  AT: "Austria",
  CH: "Switzerland",
  FR: "France",
};

export const GET = withAdminAuth(async () => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: applications, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const enrichedApplications = await Promise.all(
      (applications ?? []).map(async (app) => {
        const api = toApi(app)!;
        if (app.user_id) {
          const { data: user } = await supabase
            .from("users")
            .select("profile")
            .eq("clerk_id", app.user_id)
            .maybeSingle();
          return { ...api, userProfile: user?.profile ?? null };
        }
        return { ...api, userProfile: null };
      }),
    );

    return NextResponse.json(enrichedApplications);
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const { applicationId, status } = body;

    const supabase = getSupabaseAdmin();
    const { data: application, error: fetchErr } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const { data: updatedApp, error: updateErr } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    if (status === "approved" && application.user_id) {
      const country = PROGRAM_MAP[application.program_id] || "General";
      const profilePatch = {
        phone: application.phone,
        languages: `Level: ${application.level}`,
        motivation: application.message,
      };

      const { data: existingUser } = await supabase
        .from("users")
        .select("profile")
        .eq("clerk_id", application.user_id)
        .maybeSingle();

      const mergedProfile = {
        ...(typeof existingUser?.profile === "object" && existingUser.profile !== null
          ? existingUser.profile
          : {}),
        ...profilePatch,
      };

      await supabase.from("users").upsert(
        {
          clerk_id: application.user_id,
          email: application.email,
          full_name: `${application.first_name} ${application.last_name}`,
          role: "student",
          country,
          step: "Documents",
          profile: mergedProfile,
        },
        { onConflict: "clerk_id" },
      );
    }

    return NextResponse.json(toApi(updatedApp));
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
});
