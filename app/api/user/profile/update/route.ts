import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const {
      firstName, lastName, sex, dob, placeOfBirth, nationality, religion,
      phone, mobile, skype, bestTime, street, number, postalCode, city, country,
      fatherProfession, motherProfession, brothers, sisters, hobbies, languages,
      childcareExperience, householdTasks, motivation,
    } = data;

    const profile = {
      firstName,
      lastName,
      sex,
      dob: dob ? new Date(dob).toISOString() : null,
      placeOfBirth,
      nationality,
      religion,
      phone,
      mobile,
      skype,
      bestTime,
      address: { street, number, postalCode, city, country },
      fatherProfession,
      motherProfession,
      brothers,
      sisters,
      hobbies,
      languages,
      childcareExperience,
      householdTasks,
      motivation,
    };

    const supabase = getSupabaseAdmin();
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    const updatePayload: Record<string, unknown> = { profile };
    if (fullName) updatePayload.full_name = fullName;

    const { data: row, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("clerk_id", userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(toApi(row), { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
