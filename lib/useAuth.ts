"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email?: string;
  fullName?: string;
  role?: string;
  imageUrl?: string;
};

function mapUser(user: User | null, role?: string): AuthUser | null {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    fullName:
      meta.full_name ||
      meta.fullName ||
      [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
      undefined,
    role: role || meta.role || "guest",
    imageUrl: meta.avatar_url,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadLocal = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return null;
        const data = await res.json();
        return data.user as AuthUser | null;
      } catch {
        return null;
      }
    };

    const load = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (authUser) {
          let role = (authUser.user_metadata?.role as string) || "guest";
          try {
            const { data } = await supabase
              .from("users")
              .select("role, full_name, photo")
              .eq("clerk_id", authUser.id)
              .maybeSingle();
            if (data?.role) role = data.role;
            const mapped = mapUser(authUser, role);
            if (mapped && data?.full_name) mapped.fullName = data.full_name;
            if (mapped && data?.photo) mapped.imageUrl = data.photo;
            setUser(mapped);
          } catch {
            setUser(mapUser(authUser, role));
          }
          setIsLoaded(true);
          return;
        }
      } catch {
        /* Supabase client may fail when URL is dead */
      }

      const local = await loadLocal();
      if (!mounted) return;
      setUser(local);
      setIsLoaded(true);
    };

    load();

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const authUser = session?.user ?? null;
        if (!authUser) {
          loadLocal().then((local) => {
            if (mounted) {
              setUser(local);
              setIsLoaded(true);
            }
          });
          return;
        }
        setUser(mapUser(authUser));
        setIsLoaded(true);
      });
      subscription = data.subscription;
    } catch {
      /* ignore */
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoaded,
    isSignedIn: !!user,
  };
}

export async function signOut() {
  try {
    await fetch("/api/auth/me", { method: "DELETE" });
  } catch {
    /* ignore */
  }
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    /* ignore */
  }
  window.location.href = "/";
}
