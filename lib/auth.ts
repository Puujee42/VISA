import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApi } from "@/lib/supabase/mappers";
import { NextResponse } from "next/server";

export type SessionUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  photo?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { isAdminPhone, normalizePhone, phoneToEmail } = await import(
      "@/lib/phone"
    );

    const meta = user.user_metadata || {};
    const fullName =
      meta.full_name ||
      meta.fullName ||
      [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
      undefined;

    let role = (meta.role as string) || "guest";
    let photo = (meta.avatar_url as string) || undefined;
    let phoneFromMeta = meta.phone ? normalizePhone(String(meta.phone)) : "";

    // Synthetic phone emails: 99918122@phone.aupair.mn
    if (!phoneFromMeta && user.email?.endsWith("@phone.aupair.mn")) {
      phoneFromMeta = normalizePhone(user.email.split("@")[0] || "");
    }

    try {
      const admin = getSupabaseAdmin();
      const { data } = await admin
        .from("users")
        .select("role, full_name, photo, email, phone, profile")
        .eq("clerk_id", user.id)
        .maybeSingle();

      if (data?.role) role = String(data.role);
      if (data?.photo) photo = String(data.photo);

      const phoneFromDb =
        (data?.phone && normalizePhone(String(data.phone))) ||
        (data?.profile &&
        typeof data.profile === "object" &&
        "phone" in (data.profile as object)
          ? normalizePhone(String((data.profile as { phone?: string }).phone || ""))
          : "");

      const phone = phoneFromDb || phoneFromMeta;

      if (phone && isAdminPhone(phone)) {
        role = "admin";
        if (data?.role !== "admin" || data?.phone !== phone) {
          await admin
            .from("users")
            .update({ role: "admin", phone })
            .eq("clerk_id", user.id);
        }
      }

      // Also match by known admin synthetic email
      if (
        user.email &&
        isAdminPhone(user.email.replace("@phone.aupair.mn", ""))
      ) {
        role = "admin";
      }

      return {
        id: user.id,
        email: user.email || data?.email || undefined,
        fullName: data?.full_name || fullName,
        firstName: meta.first_name,
        lastName: meta.last_name,
        role,
        photo,
      };
    } catch {
      if (phoneFromMeta && isAdminPhone(phoneFromMeta)) {
        role = "admin";
      } else if (
        user.email === phoneToEmail("99918122") ||
        (user.email?.endsWith("@phone.aupair.mn") &&
          isAdminPhone(user.email.split("@")[0] || ""))
      ) {
        role = "admin";
      }

      return {
        id: user.id,
        email: user.email,
        fullName,
        firstName: meta.first_name,
        lastName: meta.last_name,
        role,
        photo,
      };
    }
  } catch (error) {
    console.error("[auth] getSessionUser failed:", error);
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.id ?? null;
}

/** Ensure a row exists in public.users for this auth user (clerk_id stores auth UUID). */
export async function ensureUserProfile(input: {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role?: string;
}) {
  const { isAdminPhone, normalizePhone } = await import("@/lib/phone");
  const admin = getSupabaseAdmin();
  const { data: existing } = await admin
    .from("users")
    .select("id, role, phone, profile")
    .eq("clerk_id", input.id)
    .maybeSingle();

  const phone = input.phone ? normalizePhone(input.phone) : existing?.phone || undefined;
  const forceAdmin = phone ? isAdminPhone(phone) : false;
  const role = forceAdmin
    ? "admin"
    : input.role || existing?.role || "guest";

  const profile =
    existing?.profile && typeof existing.profile === "object"
      ? { ...(existing.profile as object), ...(phone ? { phone } : {}) }
      : phone
        ? { phone }
        : {};

  const { data, error } = await admin
    .from("users")
    .upsert(
      {
        clerk_id: input.id,
        email: input.email,
        full_name: input.fullName || "New User",
        role,
        ...(phone ? { phone } : {}),
        profile,
      },
      { onConflict: "clerk_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return toApi(data);
}

export function isAdminAuthorized(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const header = req.headers.get("x-admin-secret");
  const cookie = req.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)admin_secret=([^;]+)/)?.[1];
  return header === secret || cookie === secret;
}

export function withAdminAuth(
  handler: (req: Request, context: unknown) => Promise<NextResponse>,
) {
  return async (req: Request, context: unknown) => {
    try {
      if (isAdminAuthorized(req)) {
        return handler(req, context);
      }

      const user = await getSessionUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { status: 403 },
        );
      }
      return handler(req, context);
    } catch (error) {
      console.error("[AdminAuth] Unexpected error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
