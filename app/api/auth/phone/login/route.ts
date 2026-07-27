import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminPhone, normalizePhone, phoneToEmail } from "@/lib/phone";
import { withSupabaseTimeout } from "@/lib/supabase/timeout";
import {
  LOCAL_SESSION_COOKIE,
  localLogin,
  localSessionCookieOptions,
  signLocalSession,
} from "@/lib/localAuth";

function isUnreachable(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error || "");
  return /ENOTFOUND|fetch failed|timed out|timeout|Failed to fetch|getaddrinfo/i.test(
    msg,
  );
}

async function loginLocal(phone: string, password: string) {
  const user = await localLogin({ phone, password });
  const token = signLocalSession(user);
  const res = NextResponse.json({
    ok: true,
    role: user.role,
    phone: user.phone,
    email: user.email,
    sessionSet: true,
    local: true,
  });
  res.cookies.set(LOCAL_SESSION_COOKIE, token, localSessionCookieOptions());
  return res;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.phone || "");
    const password = String(body.password || "");

    if (phone.length < 8) {
      return NextResponse.json(
        { error: "Утасны дугаар 8 оронтой байх ёстой." },
        { status: 400 },
      );
    }
    if (!password) {
      return NextResponse.json(
        { error: "Нууц үгээ оруулна уу." },
        { status: 400 },
      );
    }

    const email = phoneToEmail(phone);

    try {
      const { createClient: createServerSupabase } = await import(
        "@/utils/supabase/server"
      );
      const serverClient = await createServerSupabase();
      const { data, error: signInErr } =
        await serverClient.auth.signInWithPassword({
          email,
          password,
        });

      if (signInErr || !data.user) {
        // Maybe local-only account
        try {
          return await loginLocal(phone, password);
        } catch {
          return NextResponse.json(
            { error: "Утас эсвэл нууц үг буруу байна." },
            { status: 401 },
          );
        }
      }

      let role = "guest";
      try {
        const admin = getSupabaseAdmin();
        const { data: profile } = await withSupabaseTimeout(
          admin
            .from("users")
            .select("role, phone")
            .eq("clerk_id", data.user.id)
            .maybeSingle(),
        );

        role = String(profile?.role || "guest");

        if (isAdminPhone(phone) && role !== "admin") {
          await admin
            .from("users")
            .update({ role: "admin", phone })
            .eq("clerk_id", data.user.id);
          role = "admin";
        } else if (!profile) {
          await admin.from("users").upsert(
            {
              clerk_id: data.user.id,
              email,
              phone,
              full_name:
                data.user.user_metadata?.full_name || `User ${phone}`,
              role: isAdminPhone(phone) ? "admin" : "guest",
              profile: { phone },
            },
            { onConflict: "clerk_id" },
          );
          role = isAdminPhone(phone) ? "admin" : "guest";
        }
      } catch (profileErr) {
        console.error("[phone/login] profile sync", profileErr);
        if (isAdminPhone(phone)) role = "admin";
      }

      return NextResponse.json({
        ok: true,
        role,
        phone,
        email,
        sessionSet: true,
      });
    } catch (supabaseErr) {
      if (isUnreachable(supabaseErr)) {
        console.warn(
          "[phone/login] Supabase unreachable — using local auth fallback",
        );
      } else {
        console.error("[phone/login] supabase", supabaseErr);
      }
      try {
        return await loginLocal(phone, password);
      } catch (localErr) {
        const msg =
          localErr instanceof Error
            ? localErr.message
            : "Утас эсвэл нууц үг буруу байна.";
        return NextResponse.json({ error: msg }, { status: 401 });
      }
    }
  } catch (error) {
    console.error("[phone/login]", error);
    return NextResponse.json(
      { error: "Нэвтрэлт амжилтгүй. Дахин оролдоно уу." },
      { status: 500 },
    );
  }
}
