import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isDbId, toApi, toDb } from "@/lib/supabase/mappers";
import { withAdminAuth } from "@/lib/adminAuth";

async function findUserRow(userId: string) {
  const supabase = getSupabaseAdmin();
  if (isDbId(userId)) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (data) return data;
  }
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .maybeSingle();
  return data;
}

async function updateUserById(userId: string, fields: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const dbPayload = toDb(fields);
  const existing = await findUserRow(userId);

  if (!existing) return null;

  const { data, error } = await supabase
    .from("users")
    .update(dbPayload)
    .eq("id", existing.id)
    .select()
    .single();

  if (error) throw error;
  return toApi(data);
}

function formatUser(row: NonNullable<Awaited<ReturnType<typeof findUserRow>>>) {
  const api = toApi(row)!;
  return {
    _id: api._id,
    clerkId: api.clerkId,
    fullName: api.fullName || "Unknown User",
    email: api.email,
    role: api.role || "guest",
    status: api.status || "Active",
    country: api.country || "-",
    step: api.step || "-",
    photo: api.photo,
    profile: api.profile || {},
    updatedAt: api.updatedAt,
    createdAt: api.createdAt,
  };
}

export const GET = withAdminAuth(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  const includeDocuments = searchParams.get("includeDocuments") === "true";

  if (userId && includeDocuments) {
    const userRow = await findUserRow(userId);
    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(toApi(userRow));
  }

  const supabase = getSupabaseAdmin();
  const { data: dbUsers, error } = await supabase.from("users").select("*");
  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  const mergedUsers = (dbUsers ?? []).map(formatUser);

  const roleOrder: Record<string, number> = { admin: 3, student: 2, guest: 1 };
  mergedUsers.sort((a, b) => {
    const orderA = roleOrder[String(a.role).toLowerCase()] || 0;
    const orderB = roleOrder[String(b.role).toLowerCase()] || 0;
    if (orderA !== orderB) return orderB - orderA;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return NextResponse.json(mergedUsers);
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    const body = await req.json();
    const { userId, action, data } = body;

    if (action === "update_user") {
      if (!userId) {
        return NextResponse.json({ error: "Missing User ID" }, { status: 400 });
      }

      const updatedUser = await updateUserById(userId, {
        role: data.role,
        country: data.country,
        step: data.step,
        status: data.status,
        fullName: data.fullName,
      });

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === "master_update") {
      if (!userId) {
        return NextResponse.json({ error: "Missing User ID" }, { status: 400 });
      }

      const { _id, clerkId, createdAt, ...updateData } = data;
      const ALLOWED_FIELDS = [
        "role",
        "country",
        "step",
        "status",
        "fullName",
        "phone",
        "badges",
        "documentsSubmitted",
        "documentsReviewedBy",
      ];

      const safeUpdate = Object.fromEntries(
        Object.entries(updateData).filter(([key]) =>
          ALLOWED_FIELDS.includes(key),
        ),
      ) as Record<string, unknown>;

      if ("phone" in safeUpdate) {
        const existing = await findUserRow(userId);
        safeUpdate.profile = {
          ...(typeof existing?.profile === "object" && existing.profile !== null
            ? existing.profile
            : {}),
          phone: safeUpdate.phone,
        };
        delete safeUpdate.phone;
      }

      const updatedUser = await updateUserById(userId, safeUpdate);
      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (action === "approve_documents") {
      if (!userId) {
        return NextResponse.json({ error: "Missing User ID" }, { status: 400 });
      }

      const updatedUser = await updateUserById(userId, {
        documentsReviewedBy: "Admin",
        documentsApprovedAt: new Date().toISOString(),
      });

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Database Update Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID missing" }, { status: 400 });
    }

    const userToDelete = await findUserRow(id);

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userToDelete.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE] User delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
});
