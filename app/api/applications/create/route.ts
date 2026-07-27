import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";
import { normalizePhone } from "@/lib/phone";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const data = await req.json();

    const programId = data.programId;
    const firstName = String(data.firstName || "").trim();
    const lastName = String(data.lastName || "").trim();
    const email = String(data.email || "").trim();
    const phone = normalizePhone(data.phone || "");
    const age = String(data.age || "").trim();
    const level = String(data.level || "").trim();
    const message = String(data.message || "").trim();
    const answers =
      data.answers && typeof data.answers === "object" ? data.answers : {};

    if (!programId || !firstName || !lastName || !email || !phone || !age || !level) {
      return NextResponse.json(
        { error: "Бүх заавал бөглөх талбарыг бөглөнө үү." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("applications")
      .insert({
        program_id: programId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        age,
        level,
        message,
        answers,
        user_id: userId,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // In-app admin notification
    try {
      await supabase.from("admin_notifications").insert({
        type: "application",
        title: `Шинэ өргөдөл: ${firstName} ${lastName}`,
        body: `${programId} · ${phone} · ${email} · түвшин ${level}`,
        link: "/admin?tab=applications",
        meta: {
          applicationId: row.id,
          programId,
          phone,
          email,
        },
        is_read: false,
      });
    } catch (notifyErr) {
      console.error("[applications/create] notification failed", notifyErr);
    }

    return NextResponse.json(toApi(row), { status: 201 });
  } catch (error) {
    console.error("Application creation error:", error);
    return NextResponse.json(
      { error: "Өргөдөл илгээж чадсангүй. Дахин оролдоно уу." },
      { status: 500 },
    );
  }
}
