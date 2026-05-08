import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import Lesson from "@/lib/models/Lesson";
import User from "@/lib/models/User";
import { CACHE_TIMES, createCacheHeaders } from "@/lib/cache-config";

// Revalidate this route every 60 seconds
export const revalidate = 60;


export async function GET(req: Request) {
    try {
        await connectToDB();

        // Parse Query Parameters
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const country = searchParams.get("country");

        if (id) {
            const lesson = await Lesson.findById(id).populate('attendees', '_id fullName photo');
            if (!lesson) {
                return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
            }
            return NextResponse.json(lesson, {
                headers: createCacheHeaders(300) // Cache individual lesson for 5 minutes
            });
        }

        // Base query
        const query: any = { status: { $ne: 'archived' } };
        
        // Filter by country if provided
        if (country) {
            query.countryTag = country;
        }

        // Return visible lessons, sort by newest
        const lessons = await Lesson.find(query)
            .sort({ createdAt: -1 })
            .populate('attendees', '_id fullName photo');

        return NextResponse.json(lessons, {
            headers: createCacheHeaders(CACHE_TIMES.dynamic) // Cache list for 1 minute
        });
    } catch (error) {
        console.error("Failed to fetch lessons", error);
        return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();

        // Find internal user ID based on Clerk ID
        const user = await User.findOne({ clerkId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { lessonId } = await req.json();
        if (!lessonId) {
            return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
        }

        // Check if already registered
        const isRegistered = lesson.attendees.includes(user._id);

        if (isRegistered) {
            return NextResponse.json({ message: "Already registered", lesson }, { status: 200 });
        }

        // Add user
        lesson.attendees.push(user._id);
        await lesson.save();

        return NextResponse.json({ message: "Registered successfully", lesson }, { status: 200 });
    } catch (error) {
        console.error("Lesson registration error:", error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();

        const user = await User.findOne({ clerkId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        let lessonId = searchParams.get("lessonId");

        if (!lessonId) {
            try {
                const body = await req.json();
                lessonId = body.lessonId;
            } catch (e) {
                // skip
            }
        }

        if (!lessonId) {
            return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
        }

        const lesson = await Lesson.findByIdAndUpdate(
            lessonId,
            { $pull: { attendees: user._id } },
            { new: true }
        );

        if (!lesson) {
            return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Unregistered successfully", lesson }, { status: 200 });
    } catch (error) {
        console.error("Lesson unregistration error:", error);
        return NextResponse.json({ error: "Unregistration failed" }, { status: 500 });
    }
}