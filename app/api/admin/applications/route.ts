import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import Application from "@/lib/models/Application";
import User from "@/lib/models/User";
import { withAdminAuth } from "@/lib/adminAuth";

const PROGRAM_MAP: Record<string, string> = {
  "DE": "Germany",
  "BE": "Belgium",
  "AT": "Austria",
  "CH": "Switzerland",
  "FR": "France"
};

export const GET = withAdminAuth(async () => {
  try {
    await connectToDB();
    
    // We want to fetch applications and if they have a userId (clerkId), attach the user's detailed profile
    const applications = await Application.find({}).sort({ createdAt: -1 }).lean();
    
    const enrichedApplications = await Promise.all(applications.map(async (app: any) => {
      if (app.userId) {
        const user = await User.findOne({ clerkId: app.userId }).select('profile').lean();
        return { ...app, userProfile: user?.profile || null };
      }
      return { ...app, userProfile: null };
    }));

    return NextResponse.json(enrichedApplications);
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const body = await req.json();
    const { applicationId, status } = body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    application.status = status;
    await application.save();

    // If approved and user exists, upgrade user to student and sync latest info
    if (status === 'approved' && application.userId) {
       const country = PROGRAM_MAP[application.programId] || "General";
       
       await User.findOneAndUpdate(
         { clerkId: application.userId },
         { 
            $set: {
                role: 'student', 
                country: country,
                step: "Documents",
                fullName: `${application.firstName} ${application.lastName}`,
                email: application.email,
                "profile.phone": application.phone,
                "profile.languages": `Level: ${application.level}`,
                "profile.motivation": application.message
            }
         },
         { new: true, upsert: true }
       );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
});