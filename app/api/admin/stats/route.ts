import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import News from "@/lib/models/News";
import Application from "@/lib/models/Application";
import Booking from "@/lib/models/Booking";
import { withAdminAuth } from "@/lib/adminAuth";
import { clerkClient } from "@clerk/nextjs/server";
import { DESTINATION_COUNTRY_COUNT } from "@/lib/config";

export const GET = withAdminAuth(async () => {
  try {
    await connectToDB();

    const todayStr = new Date().toISOString().split("T")[0];

    // Get accurate total from Clerk (source of truth for all users)
    let totalUsers = 0;
    try {
      const client = await clerkClient();
      const clerkCount = await client.users.getCount();
      totalUsers = clerkCount;
    } catch {
      // Fallback to MongoDB count if Clerk is unreachable
      totalUsers = await User.countDocuments({});
    }

    const [
      blogsPublished,
      pendingApplications,
      studentsCount,
      adminsCount,
      guestsCount,
      todaysBookings,
    ] = await Promise.all([
      News.countDocuments({ status: "published" }),
      Application.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "guest" }),
      Booking.countDocuments({
        date: todayStr,
        status: { $nin: ["cancelled", "rejected"] },
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
      { status: 500 }
    );
  }
});
