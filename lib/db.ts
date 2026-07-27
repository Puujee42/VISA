import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** @deprecated Use getSupabaseAdmin() directly. Kept for migration compatibility. */
export async function connectToDB() {
  return getSupabaseAdmin();
}

/** @deprecated Use getSupabaseAdmin() directly. */
export async function connectToDBWithRetry(_maxAttempts = 2) {
  return getSupabaseAdmin();
}

export default connectToDBWithRetry;
