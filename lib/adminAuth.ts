import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export function withAdminAuth(
  handler: (req: Request, context: any) => Promise<NextResponse>
) {
  return async (req: Request, context: any) => {
    try {
      // Step 1: Verify session via Clerk — reads raw cookie, no middleware context needed
      let clerkUser: any = null;
      try {
        clerkUser = await currentUser();
      } catch (authError) {
        console.error("[AdminAuth] currentUser() failed:", authError);
        return NextResponse.json(
          { error: "Authentication service unavailable" },
          { status: 503 }
        );
      }

      if (!clerkUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Step 2: Fast path — check publicMetadata set at role-update time
      if (clerkUser.publicMetadata?.role === "admin") {
        return handler(req, context);
      }

      // Step 3: Fallback — verify in MongoDB
      try {
        await connectToDB();
      } catch (dbError) {
        console.error("[AdminAuth] DB connection failed:", dbError);
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 }
        );
      }

      const dbUser = await User.findOne({ clerkId: clerkUser.id }).lean();

      if (!dbUser) {
        return NextResponse.json(
          { error: "Forbidden: User not found" },
          { status: 403 }
        );
      }

      if ((dbUser as any).role !== "admin") {
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
