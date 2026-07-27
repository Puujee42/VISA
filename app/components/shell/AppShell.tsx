"use client";

import { useMemo, useState, useEffect } from "react";
import { Home, Plane, ShoppingBag, CalendarDays, Newspaper, ArrowLeft, Menu, X, Info, GraduationCap, Mail, FileText, ChevronRight } from "lucide-react";
import { usePathname, Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, m } from "framer-motion";
import LanguageToggle from "../LanguageToggle";
import dynamic from "next/dynamic";
import Image from "next/image";

const AuthActions = dynamic(() => import("../AuthActions"), {
  ssr: false,
  loading: () => <div className="h-9 w-[84px]" />,
});

const BRAND = { RED: "#E31B23", GREEN: "#00C896" };

const mainTabs = [
  { id: "home", href: "/", icon: Home },
  { id: "program", href: "/aupair", icon: Plane },
  { id: "shop", href: "/shop", icon: ShoppingBag, isMain: true },
  { id: "events", href: "/events", icon: CalendarDays },
  { id: "news", href: "/news", icon: Newspaper },
];

function isDetailRoute(pathname: string) {
  return pathname.includes("/events/") || pathname.includes("/news/") || pathname.includes("/shop/") || pathname.includes("/opportunities/");
}

function isFlowRoute(pathname: string) {
  return ["/apply", "/student-information", "/submit-documents", "/sign-in", "/sign-up", "/join", "/register"].some((r) => pathname.endsWith(r));
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("navbar");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const mode = useMemo(() => {
    if (pathname.endsWith("/admin")) return "admin";
    if (isFlowRoute(pathname)) return "flow";
    if (isDetailRoute(pathname)) return "detail";
    return "main";
  }, [pathname]);

  const showBottomTabs = mode === "main" || mode === "admin";

  const menuLinks = [
    { icon: Info, label: t("about"), href: "/about" },
    { icon: GraduationCap, label: t("lessons"), href: "/lessons" },
    { icon: FileText, label: t("register"), href: "/apply" },
    { icon: Mail, label: "Contact", href: "/contact" },
  ];

  return (
    <div className="app-shell min-h-dvh bg-[var(--app-bg)] text-slate-900">
      <header className="mobile-top-bar sticky top-0 z-40">
        <div
          className="mx-auto flex w-full max-w-lg items-center justify-between px-4"
          style={{ height: "calc(var(--app-header-height) + env(safe-area-inset-top, 0px))", paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="flex items-center gap-2.5">
            {mode === "detail" || mode === "flow" ? (
              <Link href="/" className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100/80 text-slate-700 active:scale-90 transition-transform">
                <ArrowLeft size={18} />
              </Link>
            ) : (
              <button type="button" onClick={() => setMenuOpen(true)} className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100/80 text-slate-700 active:scale-90 transition-transform" aria-label="menu">
                <Menu size={18} />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-[10px] overflow-hidden ring-1 ring-black/5">
                <Image src="/image.png" alt="Logo" fill sizes="32px" className="object-cover" />
              </div>
              <span className="text-sm font-black tracking-tight text-[var(--brand-red)]">{t("logo")}</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <AuthActions BRAND={BRAND} isMobile />
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100dvh-var(--app-header-height)-var(--app-bottom-nav-height))] w-full max-w-lg px-3 pb-28 pt-3">
        {children}
      </main>

      {showBottomTabs && (
        <nav className="mobile-tab-bar fixed bottom-0 left-0 right-0 z-50">
          <div
            className="mx-auto grid w-full max-w-lg grid-cols-5 items-end px-1 pt-1.5"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)", minHeight: "var(--app-bottom-nav-height)" }}
          >
            {mainTabs.map((tab) => {
              const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(`${tab.href}/`)) || (tab.href === "/" && pathname === "/");
              const Icon = tab.icon;

              if (tab.isMain) {
                return (
                  <div key={tab.id} className="flex flex-col items-center justify-end pb-0.5">
                    <Link href={tab.href} className="outline-none -mt-5">
                      <m.div whileTap={{ scale: 0.88 }} className="mobile-fab" style={{ backgroundColor: BRAND.RED }}>
                        <Icon size={22} strokeWidth={2.5} />
                      </m.div>
                    </Link>
                    <span className={`text-[10px] font-bold mt-1 ${active ? "text-[var(--brand-green)]" : "text-[var(--app-tab-inactive)]"}`}>{t(tab.id as "home")}</span>
                  </div>
                );
              }

              return (
                <Link key={tab.id} href={tab.href} className={`mobile-tab-item ${active ? "mobile-tab-item--active" : "mobile-tab-item--inactive"}`}>
                  {active && <m.div layoutId="appShellTabPill" className="mobile-tab-pill" />}
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} className="relative z-10" />
                  <span className="relative z-10 text-[10px] font-bold">{t(tab.id as "home")}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <AnimatePresence>
        {menuOpen && (
          <>
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/40" onClick={() => setMenuOpen(false)} />
            <m.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 36 }} className="fixed bottom-0 inset-x-0 z-[201] mobile-sheet pb-[max(env(safe-area-inset-bottom),16px)]">
              <div className="mobile-sheet-handle" />
              <div className="px-4 py-2 space-y-1">
                {menuLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl active:bg-slate-100/80">
                    <link.icon size={18} className="text-[var(--brand-green)]" />
                    <span className="flex-1 text-[15px] font-semibold">{link.label}</span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </Link>
                ))}
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
