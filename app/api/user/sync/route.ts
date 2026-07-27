import { NextResponse } from "next/server";
import { getSessionUser, ensureUserProfile } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const user = await ensureUserProfile({
      id: session.id,
      email: session.email || body.email || "",
      fullName: body.fullName || session.fullName,
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("!!!!! SYNC FAILED !!!!!", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
