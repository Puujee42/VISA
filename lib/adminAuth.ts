import { auth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export function withAdminAuth(handler: (req: Request, context: any) => Promise<NextResponse>) {
  return async (req: Request, context: any) => {
    try {
      // Step 1: Authenticate with Clerk
      let userId: string | null = null;
      try {
        const authResult = await auth();
        userId = authResult.userId;
      } catch (authError) {
        console.error("[AdminAuth] Clerk auth() failed:", authError);
        return NextResponse.json(
          { error: "Authentication service unavailable" },
          { status: 503 }
        );
      }

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Step 2: Connect to database
      try {
        await connectToDB();
      } catch (dbError) {
        console.error("[AdminAuth] Database connection failed:", dbError);
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 }
        );
      }

      // Step 3: Verify admin role
      const user = await User.findOne({ clerkId: userId });

      if (!user) {
        console.error(`[AdminAuth] No user found for clerkId: ${userId}`);
        return NextResponse.json(
          { error: "Forbidden: User not found in database" },
          { status: 403 }
        );
      }

      if (user.role !== "admin") {
        console.error(`[AdminAuth] User ${userId} has role "${user.role}", not admin`);
        return NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { status: 403 }
        );
      }

      return handler(req, context);
    } catch (error) {
      console.error("[AdminAuth] Unexpected error:", error);
      return NextResponse.json(
        { error: "Internal Server Error", details: String(error) },
        { status: 500 }
      );
    }
  };
}
