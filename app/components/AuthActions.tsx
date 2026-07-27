"use client";

import React from "react";
import { Link } from "@/navigation";
import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth, signOut } from "@/lib/useAuth";
import { LogOut, LayoutDashboard } from "lucide-react";

interface AuthActionsProps {
  BRAND: { RED: string };
  isMobile?: boolean;
}

const AuthActions = ({ BRAND, isMobile }: AuthActionsProps) => {
  const t = useTranslations("Auth");
  const { user, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className={isMobile ? "w-9 h-9" : "w-[84px] h-9"} />;
  }

  if (isSignedIn && user) {
    const dashboardHref = user.role === "admin" ? "/admin" : "/dashboard";

    if (isMobile) {
      return (
        <div className="flex items-center gap-1.5">
          <Link
            href={dashboardHref}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-700 active:scale-90"
            aria-label={t("dashboard")}
          >
            <LayoutDashboard size={16} />
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white active:scale-90"
            style={{ backgroundColor: BRAND.RED }}
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link
          href={dashboardHref}
          className="text-[9px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 border-b-2 hidden xl:block"
          style={{ borderColor: BRAND.RED }}
        >
          {t("dashboard")}
        </Link>
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-700">
            {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <Link href="/sign-in">
        <m.button
          whileTap={{ scale: 0.92 }}
          className="flex items-center justify-center w-9 h-9 rounded-full text-white active:opacity-80 transition-opacity"
          style={{ backgroundColor: BRAND.RED }}
          aria-label={t("signIn")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </m.button>
      </Link>
    );
  }

  return (
    <Link href="/sign-in">
      <button
        className="px-5 py-2 min-w-[80px] rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all active:scale-95 hover:brightness-110"
        style={{ backgroundColor: BRAND.RED }}
      >
        {t("signIn")}
      </button>
    </Link>
  );
};

export default AuthActions;
