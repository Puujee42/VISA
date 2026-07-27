import { createHash, randomInt } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/phone";
import { withSupabaseTimeout } from "@/lib/supabase/timeout";

function hashCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.phone || "");

    if (phone.length < 8) {
      return NextResponse.json(
        { error: "Утасны дугаар буруу байна (8 орон)." },
        { status: 400 },
      );
    }

    const code = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const supabase = getSupabaseAdmin();

    await withSupabaseTimeout(
      supabase.from("phone_otps").upsert({
        phone,
        code_hash: hashCode(phone, code),
        expires_at: expiresAt,
        attempts: 0,
      }),
    );

    // SMS gateway optional — without it, return code so login still works.
    // Set SMS_WEBHOOK_URL later to send real SMS.
    if (process.env.SMS_WEBHOOK_URL) {
      try {
        await fetch(process.env.SMS_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            message: `AUPAIR код: ${code}. 5 минутын дотор оруулна уу.`,
          }),
        });
      } catch (err) {
        console.error("[phone/send-otp] SMS webhook failed", err);
      }
    } else {
      console.log(`[phone/send-otp] ${phone} => ${code}`);
    }

    const exposeCode =
      !process.env.SMS_WEBHOOK_URL ||
      process.env.ALLOW_DEV_OTP === "true" ||
      process.env.NODE_ENV !== "production";

    return NextResponse.json({
      ok: true,
      phone,
      expiresIn: 300,
      ...(exposeCode ? { code } : {}),
      message: exposeCode
        ? "Код илгээгдлээ (SMS тохируулаагүй тул код харагдаж байна)."
        : "Код илгээгдлээ.",
    });
  } catch (error) {
    console.error("[phone/send-otp]", error);
    const msg = error instanceof Error ? error.message : "";
    const unreachable =
      /ENOTFOUND|fetch failed|timed out|timeout|Failed to fetch/i.test(msg);
    return NextResponse.json(
      {
        error: unreachable
          ? "Supabase сервертэй холбогдож чадсангүй. .env доторх NEXT_PUBLIC_SUPABASE_URL-ийг шалгана уу."
          : "Код илгээж чадсангүй. Дахин оролдоно уу.",
      },
      { status: 500 },
    );
  }
}
