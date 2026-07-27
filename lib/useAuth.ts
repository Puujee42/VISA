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
    const supabase = createClient();
    let mounted = true;

    const load = async () => {
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
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      if (!authUser) {
        setUser(null);
        setIsLoaded(true);
        return;
      }
      setUser(mapUser(authUser));
      setIsLoaded(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoaded,
    isSignedIn: !!user,
  };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/";
}
