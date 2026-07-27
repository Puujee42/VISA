import { NextResponse } from "next/server";
import { ensureUserProfile, getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const email = body.email || session.email;
    const fullName = body.fullName || session.fullName;
    const authId = body.authId || session.id;

    if (!email || !authId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (authId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await ensureUserProfile({
      id: authId,
      email,
      fullName,
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
