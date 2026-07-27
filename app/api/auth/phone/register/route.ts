import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import {
  LOCAL_SESSION_COOKIE,
  localLogin,
  localRegister,
  localSessionCookieOptions,
  signLocalSession,
} from "@/lib/localAuth";
import { mongoRegister, mongoUserToSession } from "@/lib/mongoAuth";

function isMongoDown(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error || "");
  return /MONGODB_URI|MongoServerError|MongoNetworkError|ENOTFOUND|bad auth|authentication failed|ECONNREFUSED|timed out/i.test(
    msg,
  );
}

function sessionResponse(
  user: { id: string; phone: string; email: string; fullName: string; role: string },
  provider: string,
) {
  const token = signLocalSession(user);
  const res = NextResponse.json({
    ok: true,
    role: user.role,
    phone: user.phone,
    email: user.email,
    sessionSet: true,
    provider,
  });
  res.cookies.set(LOCAL_SESSION_COOKIE, token, localSessionCookieOptions());
  return res;
}

async function registerLocalFallback(
  phone: string,
  password: string,
  fullName: string,
) {
  try {
    const user = await localRegister({ phone, password, fullName });
    return sessionResponse(user, "local");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    // Already registered locally → try login with same password
    if (/бүртгэлтэй/i.test(msg)) {
      try {
        const user = await localLogin({ phone, password });
        return sessionResponse(user, "local");
      } catch {
        return NextResponse.json(
          { error: "Энэ утас бүртгэлтэй. Нэвтрэх хуудаснаас нэвтэрнэ үү." },
          { status: 409 },
        );
      }
    }
    throw err;
  }
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

    try {
      const user = await mongoRegister({ phone, password, fullName });
      return sessionResponse(mongoUserToSession(user), "mongodb");
    } catch (mongoErr) {
      const msg = mongoErr instanceof Error ? mongoErr.message : "";
      if (/бүртгэлтэй/i.test(msg)) {
        return NextResponse.json({ error: msg }, { status: 409 });
      }
      if (isMongoDown(mongoErr)) {
        console.warn(
          "[phone/register] MongoDB unreachable — local auth fallback",
          msg,
        );
        return registerLocalFallback(phone, password, fullName);
      }
      throw mongoErr;
    }
  } catch (error) {
    console.error("[phone/register]", error);
    const msg = error instanceof Error ? error.message : "";
    if (/бүртгэлтэй/i.test(msg)) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    return NextResponse.json(
      { error: msg || "Бүртгэл амжилтгүй. Дахин оролдоно уу." },
      { status: 500 },
    );
  }
}
