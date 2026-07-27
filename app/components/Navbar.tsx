"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname } from "@/navigation";
import Image from "next/image";
import {
  Home,
  BookOpen,
  ShoppingBag,
  Ticket,
  Plane,
  ChevronDown,
  Menu,
  X,
  Info,
  GraduationCap,
  Mail,
  FileText,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import LanguageToggle from "./LanguageToggle";
import { Capacitor } from "@capacitor/core";

const AuthActions = dynamic(() => import("./AuthActions"), {
  ssr: false,
  loading: () => <div className="w-[120px] h-9" />,
});

const BRAND = {
  RED: "#E31B23",
  GREEN: "#00C896",
  WHITE: "#FFFFFF",
};

export default function Navbar() {
  const t = useTranslations("navbar");
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    try {
      setIsNative(Capacitor.isNativePlatform());
    } catch {
      setIsNative(false);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const desktopNav = [
    { name: t("home"), href: "/" },
    { name: t("about"), href: "/about" },
    { name: t("program"), href: "/aupair", hasDropdown: true },
    { name: t("events"), href: "/events" },
    { name: t("lessons"), href: "/lessons" },
    { name: t("shop"), href: "/shop" },
    { name: t("news"), href: "/news" },
  ];

  const mobileNav = [
    { id: "home", icon: Home, href: "/", label: t("home") },
    { id: "aupair", icon: Plane, href: "/aupair", label: t("program") },
    { id: "shop", icon: ShoppingBag, href: "/shop", label: t("shop") },
    { id: "events", icon: Ticket, href: "/events", label: t("events") },
    { id: "news", icon: BookOpen, href: "/news", label: t("news") },
  ];

  const menuLinks = [
    { icon: Info, label: t("about"), href: "/about" },
    { icon: GraduationCap, label: t("lessons"), href: "/lessons" },
    { icon: FileText, label: t("register"), href: "/apply" },
    { icon: Mail, label: t("contact"), href: "/contact" },
  ];

  const AU_PAIR_COUNTRIES = [
    {
      code: "DE",
      name: t("germany"),
      desc: t("desc_de"),
      href: "/aupair/germany",
      flag: "🇩🇪",
    },
    {
      code: "AT",
      name: t("austria"),
      desc: t("desc_at"),
      href: "/aupair/austria",
      flag: "🇦🇹",
    },
    {
      code: "CH",
      name: t("switzerland"),
      desc: t("desc_ch"),
      href: "/aupair/switzerland",
      flag: "🇨🇭",
    },
    {
      code: "BE",
      name: t("belgium"),
      desc: t("desc_be"),
      href: "/aupair/belgium",
      flag: "🇧🇪",
    },
    {
      code: "FR",
      name: t("france"),
      desc: t("desc_fr"),
      href: "/aupair/france",
      flag: "🇫🇷",
    },
  ];

  const isHome = pathname === "/";
  const showBottomTabs = !isNative;

  return (
    <>
      <header
        className={`fixed left-0 right-0 hidden lg:flex justify-center pointer-events-none z-[999] ${
          isHome ? "top-0 pt-5" : "top-4"
        }`}
      >
        <nav
          onMouseLeave={() => setHoveredNav(null)}
          className={`
            z-[100] pointer-events-auto flex items-center justify-between
            transition-[background-color,box-shadow,border-color] duration-300 relative
            w-[min(1240px,calc(100%-2rem))] py-2.5 px-5 rounded-2xl
            border text-[#001829] isolate
            ${isScrolled || !isHome
              ? "bg-white/95 border-slate-200/80 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)]"
              : "bg-white/92 border-white/80 shadow-[0_10px_40px_-16px_rgba(15,23,42,0.28)]"
            }
          `}
        >
          <Link href="/" className="relative z-10 flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 overflow-hidden rounded-full border border-slate-200/80 shadow-sm bg-white shrink-0">
              <Image
                src="/image.png"
                alt="AUPAIR"
                fill
                priority
                sizes="36px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                quality={75}
              />
            </div>
            <span
              className="relative z-10 font-sans font-black text-[17px] tracking-[0.04em] uppercase leading-none"
              style={{ color: BRAND.RED }}
            >
              {t("logo")}
            </span>
          </Link>

          <div className="flex items-center gap-1 bg-current/5 p-1 rounded-full mx-2 relative">
            {desktopNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.hasDropdown && pathname.startsWith(item.href));

              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() =>
                    item.hasDropdown && setHoveredNav(item.href)
                  }
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide transition-[color,background-color] duration-300 whitespace-nowrap
                      ${isActive
                        ? "bg-white/80 backdrop-blur-sm text-[#00C896] border border-white/60"
                        : "opacity-80 hover:opacity-100 hover:text-[#00C896] hover:bg-white/50 hover:border-white/60"
                      }`}
                  >
                    {item.name}
                    {item.hasDropdown && (
                      <ChevronDown size={10} className="mt-0.5" />
                    )}
                  </Link>

                  <AnimatePresence>
                    {item.hasDropdown && hoveredNav === item.href && (
                      <m.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[560px] p-4 text-slate-800 bg-white border border-slate-100 shadow-xl rounded-2xl"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          {AU_PAIR_COUNTRIES.map((country) => (
                            <Link
                              key={country.code}
                              href={country.href}
                              className="group flex items-start gap-4 p-3 rounded-2xl transition-all border duration-300 shadow-sm border-transparent hover:bg-[#00C896]/5 hover:border-[#00C896]/30"
                            >
                              <span className="text-3xl shadow-sm rounded-md overflow-hidden">
                                {country.flag}
                              </span>
                              <div>
                                <div
                                  className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-2 transition-colors group-hover:text-[var(--hover-color)]"
                                  style={
                                    {
                                      "--hover-color": BRAND.GREEN,
                                    } as React.CSSProperties
                                  }
                                >
                                  {country.name}
                                  <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                                    →
                                  </span>
                                </div>
                                <p className="text-[10px] leading-relaxed opacity-60 font-medium">
                                  {country.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle />
            <div className="h-5 w-[1px] bg-current/10 mx-1" />
            <AuthActions BRAND={BRAND} isMobile={false} />
          </div>
        </nav>
      </header>

      {/* ── Mobile Top Bar ── */}
      <header
        className={`lg:hidden fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
          isHome ? "bg-transparent border-none" : "mobile-top-bar"
        }`}
      >
        <div
          className="flex items-center justify-between px-4"
          style={{ height: "calc(var(--app-header-height) + env(safe-area-inset-top, 0px))", paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={`flex items-center justify-center w-9 h-9 rounded-full active:scale-90 transition-all ${
                isHome
                  ? "bg-white/15 backdrop-blur-md text-white border border-white/20"
                  : "bg-slate-100/90 text-slate-700"
              }`}
              aria-label="Menu"
            >
              <Menu size={17} strokeWidth={2.5} />
            </button>
            <Link href="/" className="flex items-center gap-2 outline-none">
              <div className={`relative w-8 h-8 rounded-[10px] overflow-hidden ring-1 ${isHome ? "ring-white/30" : "ring-black/5"}`}>
                <Image src="/image.png" alt="Logo" fill priority sizes="32px" className="object-cover" quality={75} />
              </div>
              {!isHome && (
                <span className="text-[15px] font-black tracking-tight" style={{ color: BRAND.RED }}>
                  {t("logo")}
                </span>
              )}
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageToggle variant={isHome ? "light" : "dark"} />
            <AuthActions BRAND={BRAND} isMobile={true} />
          </div>
        </div>
      </header>

      {/* ── Mobile Floating Dock ── */}
      {showBottomTabs && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-[100] px-3 pointer-events-none" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}>
          <nav className="mobile-dock pointer-events-auto mx-auto max-w-md">
            <div className="grid grid-cols-5 items-center px-1 py-1.5">
              {mobileNav.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`mobile-dock-item ${isActive ? "mobile-dock-item--active" : ""}`}
                  >
                    {isActive && (
                      <m.div
                        layoutId="dockActive"
                        className="mobile-dock-active-bg"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <item.icon
                      size={21}
                      strokeWidth={isActive ? 2.4 : 1.8}
                      className={`relative z-10 transition-colors ${isActive ? "text-[var(--brand-green)]" : "text-slate-500"}`}
                    />
                    <span className={`relative z-10 text-[9px] font-semibold leading-none mt-0.5 ${isActive ? "text-[var(--brand-green)]" : "text-slate-400"}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* ── Mobile Menu Sheet ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]"
              onClick={() => setMenuOpen(false)}
            />
            <m.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="lg:hidden fixed bottom-0 inset-x-0 z-[201] mobile-sheet pb-[max(env(safe-area-inset-bottom),16px)]"
            >
              <div className="mobile-sheet-handle" />
              <div className="flex items-center justify-between px-5 pt-2 pb-4">
                <h2 className="text-lg font-black text-slate-900">{t("menuTitle")}</h2>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-transform"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-4 pb-2 space-y-1">
                {menuLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl active:bg-slate-100/80 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C896]/15 to-[#E31B23]/10 flex items-center justify-center text-[var(--brand-green)]">
                      <link.icon size={18} />
                    </div>
                    <span className="flex-1 text-[15px] font-semibold text-slate-800">{link.label}</span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </Link>
                ))}
              </div>

              <div className="px-5 pt-3 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">{t("countries")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {AU_PAIR_COUNTRIES.map((country) => (
                    <Link
                      key={country.code}
                      href={country.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 active:scale-95 transition-transform"
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{country.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
