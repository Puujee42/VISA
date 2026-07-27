import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("aupair_local_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  // Clear common supabase cookies best-effort
  for (const c of cookieStore.getAll()) {
    if (c.name.includes("sb-") || c.name.includes("supabase")) {
      res.cookies.set(c.name, "", { path: "/", maxAge: 0 });
    }
  }
  return res;
}
