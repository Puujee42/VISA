import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import {
  LOCAL_SESSION_COOKIE,
  localSessionCookieOptions,
  signLocalSession,
} from "@/lib/localAuth";
import { mongoRegister, mongoUserToSession } from "@/lib/mongoAuth";

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

    // Primary: MongoDB (existing Atlas data)
    const user = await mongoRegister({ phone, password, fullName });
    const sessionUser = mongoUserToSession(user);
    const token = signLocalSession(sessionUser);

    const res = NextResponse.json({
      ok: true,
      role: sessionUser.role,
      phone: sessionUser.phone,
      email: sessionUser.email,
      sessionSet: true,
      provider: "mongodb",
    });
    res.cookies.set(LOCAL_SESSION_COOKIE, token, localSessionCookieOptions());
    return res;
  } catch (error) {
    console.error("[phone/register]", error);
    const msg = error instanceof Error ? error.message : "";
    if (/бүртгэлтэй/i.test(msg)) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    if (/MONGODB_URI|MongoServerError|MongoNetworkError|ENOTFOUND/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "MongoDB-тай холбогдож чадсангүй. MONGODB_URI болон Atlas IP allowlist-ийг шалгана уу.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: msg || "Бүртгэл амжилтгүй. Дахин оролдоно уу." },
      { status: 500 },
    );
  }
}
