// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import { withAdminAuth } from "@/lib/adminAuth";

// 1. GET: Fetch all users for the table (or specific user with documents)
export const GET = withAdminAuth(async (req: Request) => {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  const includeDocuments = searchParams.get("includeDocuments") === "true";

  // If fetching specific user with documents
  if (userId && includeDocuments) {
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  }

  // Fetch all users sorted by role (Students first) then by update date
  const mongoUsers = await User.find({}).lean();

  // Fetch all users from Clerk using pagination
  const client = await clerkClient();
  let clerkUsers: any[] = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const res = await client.users.getUserList({ limit, offset });
    clerkUsers = clerkUsers.concat(res.data);
    if (res.data.length < limit) break;
    offset += limit;
  }

  // Merge them
  const mergedUsers = clerkUsers.map((cu: any) => {
    const mu = mongoUsers.find((u: any) => u.clerkId === cu.id);

    return {
      _id: mu?._id || cu.id,
      clerkId: cu.id,
      fullName: mu?.fullName || `${cu.firstName || ""} ${cu.lastName || ""}`.trim() || cu.username || "Unknown User",
      email: mu?.email || cu.emailAddresses[0]?.emailAddress,
      role: mu?.role || cu.publicMetadata?.role || "guest",
      status: mu?.status || "Active",
      country: mu?.country || "-",
      step: mu?.step || "-",
      photo: cu.imageUrl || mu?.photo,
      profile: mu?.profile || {},
      updatedAt: mu?.updatedAt || new Date(cu.updatedAt),
      createdAt: mu?.createdAt || new Date(cu.createdAt),
    };
  });

  // Sort: Admins first, then Students, then Guests
  const roleOrder: Record<string, number> = { admin: 3, student: 2, guest: 1 };
  mergedUsers.sort((a, b) => {
    const orderA = roleOrder[a.role.toLowerCase()] || 0;
    const orderB = roleOrder[b.role.toLowerCase()] || 0;
    if (orderA !== orderB) return orderB - orderA;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return NextResponse.json(mergedUsers);
});

// 2. PUT: The critical part that SAVES changes
export const PUT = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const body = await req.json();

    // Destructure the payload sent from AdminDashboard.tsx
    const { userId, action, data } = body;

    // --- CASE A: UPDATE USER DETAILS (Role, Country, Step) ---
    if (action === 'update_user') {
      if (!userId) return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

      // Use clerkId if userId doesn't look like a MongoDB ObjectId
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(userId);
      const query = isMongoId ? { _id: userId } : { clerkId: userId };

      const updatedUser = await User.findOneAndUpdate(
        query,
        {
          $set: {
            role: data.role,
            country: data.country,
            step: data.step,
            status: data.status,
            fullName: data.fullName,
            // Ensure clerkId is stored if we are upserting
            ...(isMongoId ? {} : { clerkId: userId })
          }
        },
        { new: true, upsert: true }
      );

      if (updatedUser && updatedUser.clerkId) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(updatedUser.clerkId, {
          publicMetadata: {
            role: data.role,
          },
        });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // --- CASE MASTER: FULL CONTROL ---
    if (action === 'master_update') {
      if (!userId) return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(userId);
      const query = isMongoId ? { _id: userId } : { clerkId: userId };

      // Clean the data to avoid updating immutable fields if any, though MongoDB handles _id
      const { _id, clerkId, createdAt, ...updateData } = data;

      const ALLOWED_FIELDS = ['role','country','step','status','fullName',
        'phone','badges','documentsSubmitted','documentsReviewedBy'];
      
      const safeUpdate = Object.fromEntries(
        Object.entries(updateData).filter(([key]) => ALLOWED_FIELDS.includes(key))
      );

      const updatedUser = await User.findOneAndUpdate(
        query,
        { $set: { ...safeUpdate, ...(isMongoId ? {} : { clerkId: userId }) } },
        { new: true, upsert: true }
      );

      // Sync metadata if role changed
      if (updateData.role && updatedUser && updatedUser.clerkId) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(updatedUser.clerkId, {
          publicMetadata: {
            role: updateData.role,
          },
        });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // --- CASE B: APPROVE DOCUMENTS ---
    if (action === 'approve_documents') {
      if (!userId) return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(userId);
      const query = isMongoId ? { _id: userId } : { clerkId: userId };

      const adminUser = await currentUser();
      const updatedUser = await User.findOneAndUpdate(
        query,
        {
          $set: {
            documentsReviewedBy: adminUser?.firstName || "Admin",
            documentsApprovedAt: new Date(),
          }
        },
        { new: true, upsert: true }
      );

      return NextResponse.json({ success: true, user: updatedUser });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Database Update Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

// 3. DELETE: Remove user
export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID missing" }, { status: 400 });
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isMongoId ? { _id: id } : { clerkId: id };

    const userToDelete = await User.findOne(query);

    // Handle case where only a Clerk ID was passed and no DB record exists yet
    if (!userToDelete && !isMongoId) {
      try {
        const client = await clerkClient();
        await client.users.deleteUser(id);
        return NextResponse.json({
          success: true,
          message: "Deleted from Clerk only (no DB record found)",
        });
      } catch {
        return NextResponse.json(
          { error: "Clerk user not found" },
          { status: 404 }
        );
      }
    }

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Delete from Clerk first
    if (userToDelete.clerkId) {
      try {
        const client = await clerkClient();
        await client.users.deleteUser(userToDelete.clerkId);
      } catch (err) {
        // Log but don't block — user may already be deleted from Clerk
        console.warn("[DELETE] Clerk delete warning:", err);
      }
    }

    // 2. Delete from MongoDB using the ObjectId we already fetched
    //    (never use the raw `id` param here — it could be a Clerk ID string)
    await User.findByIdAndDelete(userToDelete._id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE] User delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
});