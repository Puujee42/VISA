import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Supabase environment variables" },
      { status: 500 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .limit(1);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: error.code,
        hint:
          error.code === "PGRST205"
            ? "Run supabase/schema.sql in your Supabase SQL Editor first."
            : undefined,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Supabase connected",
    usersTableExists: true,
  });
}
