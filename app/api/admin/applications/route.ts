import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { connectToDB } from "@/lib/mongodb";
import Application from "@/lib/models/Application";
import User from "@/lib/models/User";

const PROGRAM_MAP: Record<string, string> = {
  DE: "Germany",
  BE: "Belgium",
  AT: "Austria",
  CH: "Switzerland",
  FR: "France",
};

function serializeApp(app: any, userProfile: unknown = null) {
  return {
    _id: app._id.toString(),
    id: app._id.toString(),
    programId: app.programId,
    firstName: app.firstName,
    lastName: app.lastName,
    email: app.email,
    phone: app.phone,
    age: app.age,
    level: app.level,
    message: app.message,
    answers: app.answers || {},
    status: app.status,
    userId: app.userId || null,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    userProfile,
  };
}

export const GET = withAdminAuth(async () => {
  try {
    await connectToDB();
    const applications = await Application.find()
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(
      applications.map(async (app: any) => {
        let userProfile = null;
        if (app.userId) {
          const user = await User.findOne({
            $or: [{ clerkId: app.userId }, { _id: app.userId }],
          })
            .select("profile")
            .lean();
          userProfile = (user as any)?.profile ?? null;
        }
        return serializeApp(app, userProfile);
      }),
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const { applicationId, status } = body;

    await connectToDB();
    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    application.status = status;
    await application.save();

    if (status === "approved" && application.userId) {
      const country = PROGRAM_MAP[application.programId] || "General";
      await User.findOneAndUpdate(
        {
          $or: [
            { clerkId: application.userId },
            { _id: application.userId },
          ],
        },
        {
          $set: {
            role: "student",
            country,
            step: "Documents",
            "profile.phone": application.phone,
            "profile.languages": `Level: ${application.level}`,
            "profile.motivation": application.message || "",
          },
        },
      );
    }

    return NextResponse.json(serializeApp(application.toObject()));
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 },
    );
  }
});
