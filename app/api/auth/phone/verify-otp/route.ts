import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isAdminPhone,
  normalizePhone,
  phoneE164,
  phoneToEmail,
} from "@/lib/phone";
import { withSupabaseTimeout } from "@/lib/supabase/timeout";

function hashCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.phone || "");
    const code = String(body.code || "").trim();
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    if (phone.length < 8 || code.length < 4) {
      return NextResponse.json(
        { error: "Утас эсвэл код буруу байна." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: otpRow, error: otpErr } = await withSupabaseTimeout(
      supabase.from("phone_otps").select("*").eq("phone", phone).maybeSingle(),
    );

    if (otpErr) throw otpErr;
    if (!otpRow) {
      return NextResponse.json(
        { error: "Код олдсонгүй. Дахин илгээнэ үү." },
        { status: 400 },
      );
    }

    if (new Date(otpRow.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Кодын хугацаа дууссан." },
        { status: 400 },
      );
    }

    if ((otpRow.attempts || 0) >= 5) {
      return NextResponse.json(
        { error: "Хэт олон буруу оролдлого. Шинэ код авна уу." },
        { status: 429 },
      );
    }

    if (otpRow.code_hash !== hashCode(phone, code)) {
      await supabase
        .from("phone_otps")
        .update({ attempts: (otpRow.attempts || 0) + 1 })
        .eq("phone", phone);
      return NextResponse.json({ error: "Код буруу байна." }, { status: 400 });
    }

    await supabase.from("phone_otps").delete().eq("phone", phone);

    const email = phoneToEmail(phone);
    const role = isAdminPhone(phone) ? "admin" : "guest";

    // Find existing profile by phone or synthetic email
    const { data: existingProfile } = await withSupabaseTimeout(
      supabase
        .from("users")
        .select("clerk_id, email, full_name, role")
        .or(`phone.eq.${phone},email.eq.${email}`)
        .maybeSingle(),
    );

    let authUserId = existingProfile?.clerk_id as string | undefined;

    if (!authUserId) {
      const { data: created, error: createErr } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          phone: phoneE164(phone),
          phone_confirm: true,
          user_metadata: {
            phone,
            full_name: fullName || `User ${phone}`,
            role,
          },
        });

      if (createErr) {
        // User may already exist in Auth — look up by email
        const { data: listed } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        const found = listed?.users?.find(
          (u) =>
            u.email === email ||
            u.phone === phoneE164(phone) ||
            u.user_metadata?.phone === phone,
        );
        if (!found) throw createErr;
        authUserId = found.id;
      } else {
        authUserId = created.user.id;
      }
    }

    if (!authUserId) {
      return NextResponse.json(
        { error: "Хэрэглэгч үүсгэж чадсангүй." },
        { status: 500 },
      );
    }

    await supabase.auth.admin.updateUserById(authUserId, {
      email,
      email_confirm: true,
      phone: phoneE164(phone),
      phone_confirm: true,
      user_metadata: {
        phone,
        full_name: fullName || existingProfile?.full_name || `User ${phone}`,
        role,
      },
    });

    const profilePayload: Record<string, unknown> = {
      clerk_id: authUserId,
      email,
      phone,
      full_name: fullName || existingProfile?.full_name || `User ${phone}`,
      profile: { phone },
      role:
        role === "admin" || existingProfile?.role === "admin"
          ? "admin"
          : existingProfile?.role || "guest",
    };

    // Always force admin for allowlisted phones
    if (isAdminPhone(phone)) {
      profilePayload.role = "admin";
    }

    await withSupabaseTimeout(
      supabase.from("users").upsert(profilePayload, { onConflict: "clerk_id" }),
    );

    const { data: linkData, error: linkErr } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error("[phone/verify-otp] generateLink", linkErr);
      return NextResponse.json(
        { error: "Нэвтрэх холбоос үүсгэхэд алдаа гарлаа." },
        { status: 500 },
      );
    }

    const tokenHash = linkData.properties.hashed_token;
    const finalRole = isAdminPhone(phone) ? "admin" : String(profilePayload.role);

    // Establish session cookies on the server (avoids browser → Supabase fetch)
    try {
      const { createClient: createServerSupabase } = await import(
        "@/utils/supabase/server"
      );
      const serverClient = await createServerSupabase();
      const { error: sessionErr } = await serverClient.auth.verifyOtp({
        token_hash: tokenHash,
        type: "email",
      });
      if (sessionErr) {
        console.error("[phone/verify-otp] server verifyOtp", sessionErr);
        // Fall back: client can still use tokenHash
        return NextResponse.json({
          ok: true,
          tokenHash,
          role: finalRole,
          phone,
          email,
          sessionSet: false,
        });
      }
    } catch (sessionError) {
      console.error("[phone/verify-otp] session cookie", sessionError);
      return NextResponse.json({
        ok: true,
        tokenHash,
        role: finalRole,
        phone,
        email,
        sessionSet: false,
      });
    }

    return NextResponse.json({
      ok: true,
      role: finalRole,
      phone,
      email,
      sessionSet: true,
    });
  } catch (error) {
    console.error("[phone/verify-otp]", error);
    const msg = error instanceof Error ? error.message : "";
    const unreachable =
      /ENOTFOUND|fetch failed|timed out|timeout|Failed to fetch/i.test(msg);
    return NextResponse.json(
      {
        error: unreachable
          ? "Supabase сервертэй холбогдож чадсангүй. .env доторх NEXT_PUBLIC_SUPABASE_URL-ийг шалгана уу."
          : "Нэвтрэлт амжилтгүй. Дахин оролдоно уу.",
      },
      { status: 500 },
    );
  }
}
