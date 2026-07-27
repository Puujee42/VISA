import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import {
  LOCAL_SESSION_COOKIE,
  localLogin,
  localSessionCookieOptions,
  signLocalSession,
} from "@/lib/localAuth";
import { mongoLogin, mongoUserToSession } from "@/lib/mongoAuth";

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

    try {
      const user = await mongoLogin({ phone, password });
      return sessionResponse(mongoUserToSession(user), "mongodb");
    } catch (mongoErr) {
      const msg = mongoErr instanceof Error ? mongoErr.message : "";

      // Wrong password / missing user from Mongo — still try local
      if (isMongoDown(mongoErr) || /буруу|тохируулаагүй/i.test(msg)) {
        if (isMongoDown(mongoErr)) {
          console.warn(
            "[phone/login] MongoDB unreachable — local auth fallback",
            msg,
          );
        }
        try {
          const user = await localLogin({ phone, password });
          return sessionResponse(user, "local");
        } catch (localErr) {
          const localMsg =
            localErr instanceof Error
              ? localErr.message
              : "Утас эсвэл нууц үг буруу байна.";
          return NextResponse.json({ error: localMsg }, { status: 401 });
        }
      }

      return NextResponse.json(
        { error: msg || "Нэвтрэлт амжилтгүй." },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("[phone/login]", error);
    return NextResponse.json(
      { error: "Нэвтрэлт амжилтгүй. Дахин оролдоно уу." },
      { status: 500 },
    );
  }
}
