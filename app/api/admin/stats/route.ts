import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { withAdminAuth } from "@/lib/adminAuth";
import { DESTINATION_COUNTRY_COUNT } from "@/lib/config";

type CountQuery = ReturnType<
  ReturnType<typeof getSupabaseAdmin>["from"]
> extends { select: (...args: never[]) => infer Q }
  ? Q
  : never;

async function countWhere(
  table: string,
  apply?: (query: CountQuery) => CountQuery,
) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (apply) query = apply(query as CountQuery) as typeof query;
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export const GET = withAdminAuth(async () => {
  try {
    const supabase = getSupabaseAdmin();
    const todayStr = new Date().toISOString().split("T")[0];

    const [
      totalUsers,
      blogsPublished,
      pendingApplications,
      studentsCount,
      adminsCount,
      guestsCount,
      todaysBookings,
    ] = await Promise.all([
      countWhere("users"),
      countWhere("news", (q) => q.eq("status", "published")),
      countWhere("applications", (q) => q.eq("status", "pending")),
      countWhere("users", (q) => q.eq("role", "student")),
      countWhere("users", (q) => q.eq("role", "admin")),
      countWhere("users", (q) => q.eq("role", "guest")),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("date", todayStr)
        .not("status", "in", '("cancelled","rejected")')
        .then(({ count, error }) => {
          if (error) throw error;
          return count ?? 0;
        }),
    ]);

    return NextResponse.json({
      totalUsers,
      blogsPublished,
      pendingApplications,
      studentsCount,
      adminsCount,
      guestsCount,
      todaysBookings,
      countries: DESTINATION_COUNTRY_COUNT,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
});
