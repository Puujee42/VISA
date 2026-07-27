import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApiList } from "@/lib/supabase/mappers";
import { withSupabaseTimeout } from "@/lib/supabase/timeout";

export const revalidate = 60;

const emptyNews = () =>
  NextResponse.json([], {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
    },
  });

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .order("published_date", { ascending: false }),
    );

    if (error) {
      console.error("[GET /api/news]", error.message);
      return emptyNews();
    }

    return NextResponse.json(toApiList(data), {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Failed to fetch news", error);
    return emptyNews();
  }
}
