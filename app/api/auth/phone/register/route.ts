import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isAdminPhone,
  normalizePhone,
  phoneE164,
  phoneToEmail,
} from "@/lib/phone";
import { withSupabaseTimeout } from "@/lib/supabase/timeout";

function unreachableError(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error || "");
  if (/ENOTFOUND|fetch failed|timed out|timeout|Failed to fetch/i.test(msg)) {
    return "Supabase сервертэй холбогдож чадсангүй. .env доторх NEXT_PUBLIC_SUPABASE_URL-ийг шалгана уу.";
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.phone || "");
    const password = String(body.password || "");
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    if (phone.length < 8) {
      return NextResponse.json(
        { error: "Утасны дугаар 8 оронтой байх ёстой." },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Нууц үг хамгийн багадаа 6 тэмдэгт байна." },
        { status: 400 },
      );
    }
    if (!fullName) {
      return NextResponse.json({ error: "Нэрээ оруулна уу." }, { status: 400 });
    }

    const email = phoneToEmail(phone);
    const role = isAdminPhone(phone) ? "admin" : "guest";
    const admin = getSupabaseAdmin();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      phone: phoneE164(phone),
      phone_confirm: true,
      user_metadata: {
        phone,
        full_name: fullName,
        role,
      },
    });

    if (createErr) {
      const msg = createErr.message || "";
      if (/already|registered|exists/i.test(msg)) {
        return NextResponse.json(
          { error: "Энэ утасны дугаар бүртгэлтэй байна. Нэвтэрнэ үү." },
          { status: 409 },
        );
      }
      throw createErr;
    }

    const authUserId = created.user.id;

    await withSupabaseTimeout(
      admin.from("users").upsert(
        {
          clerk_id: authUserId,
          email,
          phone,
          full_name: fullName,
          role,
          profile: { phone },
        },
        { onConflict: "clerk_id" },
      ),
    );

    // Set session cookies
    const { createClient: createServerSupabase } = await import(
      "@/utils/supabase/server"
    );
    const serverClient = await createServerSupabase();
    const { error: signInErr } = await serverClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInErr) {
      console.error("[phone/register] auto sign-in", signInErr);
      return NextResponse.json({
        ok: true,
        role,
        phone,
        email,
        sessionSet: false,
        message: "Бүртгэл амжилттай. Нэвтрэх хуудас руу орно уу.",
      });
    }

    return NextResponse.json({
      ok: true,
      role,
      phone,
      email,
      sessionSet: true,
    });
  } catch (error) {
    console.error("[phone/register]", error);
    return NextResponse.json(
      {
        error:
          unreachableError(error) ||
          "Бүртгэл амжилтгүй. Дахин оролдоно уу.",
      },
      { status: 500 },
    );
  }
}
