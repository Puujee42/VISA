import { NextResponse } from "next/server";

export function supabaseErrorResponse(
  error: { message: string; code?: string },
  fallback: string,
) {
  return NextResponse.json(
    {
      error: fallback,
      detail: process.env.NODE_ENV === "development" ? error.message : undefined,
      hint:
        error.code === "PGRST205"
          ? "Database tables missing. Run supabase/schema.sql in Supabase SQL Editor: https://supabase.com/dashboard/project/dsavwopzaqvdickqjmew/sql/new"
          : undefined,
    },
    { status: 500 },
  );
}
