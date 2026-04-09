"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname } from "@/navigation";
import Image from "next/image";
import {
  Home,
  Globe,
  Sun,
  Moon,
  BookOpen,
  CalendarClock,
  ShoppingBag,
  Ticket,
  Plane,
  ChevronDown,
} from "lucide-react";
import { useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Motion as motion } from "./MotionProxy";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { useIsMobile } from "./MotionProxy";
import LanguageToggle from "./LanguageToggle";
import { Capacitor } from "@capacitor/core";

// Dynamically import Clerk components to reduce initial JS bundle
const AuthActions = dynamic(() => import("./AuthActions"), {
  ssr: false,
  loading: () => <div className="w-[120px] h-9" />,
});

// --- COLOR PALETTE CONFIGURATION ---
const BRAND = {
  RED: "#E31B23",
  GREEN: "#00C896",
  WHITE: "#FFFFFF",
};

export default function Navbar() {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const isMobile = useIsMobile();
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const shouldBeScrolled = latest > 50;
    if (shouldBeScrolled !== isScrolled) {
      setIsScrolled(shouldBeScrolled);
    }
  });

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
    {
      id: "booking",
      icon: ShoppingBag,
      href: "/shop",
      label: t("shop"),
      isMain: true,
    },
    { id: "events", icon: Ticket, href: "/events", label: t("events") },
    { id: "news", icon: BookOpen, href: "/news", label: t("news") },
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
  const language = locale === "mn" ? "mn" : locale === "en" ? "en" : "de";
  return (
    <>
      <motion.header
        className="fixed top-5 left-0 right-0 hidden lg:flex justify-center pointer-events-none z-[999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <nav
          onMouseLeave={() => setHoveredNav(null)}
          style={{ WebkitBackdropFilter: "blur(12px)" }}
          className={`
          z-[100] transform-gpu pointer-events-auto flex items-center justify-between transition-[background-color,border-color,shadow,padding] duration-700 relative
          w-[98%] xl:w-[1250px] py-3 px-6 rounded-full border backdrop-blur-md text-[#001829]
          ${
            isScrolled
              ? "bg-white/95 border-emerald-100 shadow-[0_20px_40px_-15px_rgba(0,200,150,0.2)]"
              : "bg-white/80 border-white/20 shadow-none"
          }
        `}
        >
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-white/50 shadow-md bg-white">
              <Image
                src="/image.png"
                alt="AuPair Logo"
                fill
                priority
                sizes="40px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                quality={75}
              />
            </div>
            <span
              className="font-sans font-black text-lg tracking-tight uppercase"
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
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide transition-[color,background-color,shadow] duration-300 whitespace-nowrap
                      ${
                        isActive
                          ? "bg-white text-[#00C896] shadow-[0_0_15px_rgba(0,200,150,0.4)]"
                          : "opacity-80 hover:opacity-100 hover:text-[#00C896] hover:bg-[#00C896]/5 hover:shadow-[0_0_20px_rgba(0,200,150,0.6)]"
                      }`}
                  >
                    {item.name}
                    {item.hasDropdown && (
                      <ChevronDown size={10} className="mt-0.5" />
                    )}
                  </Link>

                  <AnimatePresence>
                    {item.hasDropdown && hoveredNav === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ WebkitBackdropFilter: "blur(16px)" }}
                        className="transform-gpu absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] p-4 rounded-3xl border shadow-xl z-[100] backdrop-blur-lg bg-white/95 border-emerald-50 text-slate-800"
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
                      </motion.div>
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
      </motion.header>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-[100]">
        <div
          style={{ WebkitBackdropFilter: "blur(20px)" }}
          className="flex justify-between items-center w-full px-5 pb-3 pt-[max(env(safe-area-inset-top),12px)] bg-[#FDFBF7]/90 border-b border-black/5 shadow-sm transition-all duration-500"
        >
          <Link href="/" className="flex items-center gap-3 outline-none">
            <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm bg-white">
              <Image
                src="/image.png"
                alt="Logo"
                fill
                priority
                sizes="32px"
                className="object-cover"
                quality={75}
              />
            </div>
            <span
              className="text-[17px] font-bold tracking-tight"
              style={{ color: BRAND.RED }}
            >
              {t("logo") || "AuPair"}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <AuthActions BRAND={BRAND} isMobile={true} />
          </div>
        </div>
      </div>

      {!isNative && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
          <nav
            style={{ WebkitBackdropFilter: "blur(20px)" }}
            className="w-full grid grid-cols-5 items-center justify-items-center px-4 pt-2 bg-[#FDFBF7]/90 border-t border-black/5 text-slate-500 pb-[max(env(safe-area-inset-bottom),12px)] transition-all duration-500 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]"
          >
            {mobileNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              if (item.isMain) {
                return (
                  <div
                    key={item.id}
                    className="relative flex items-center justify-center"
                  >
                    <Link
                      href={item.href}
                      className="flex items-center justify-center group outline-none -mt-5"
                    >
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white transition-all shadow-md group-hover:shadow-lg"
                        style={{
                          backgroundColor: BRAND.RED,
                          boxShadow: isActive
                            ? `0 8px 16px -4px ${BRAND.RED}80`
                            : `0 4px 12px -4px ${BRAND.RED}60`,
                        }}
                      >
                        <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      </motion.div>
                    </Link>
                  </div>
                );
              }
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col items-center justify-center relative p-2 w-full h-[52px] transition-all group outline-none"
                >
                  <div
                    className={`transition-all duration-300 ${isActive ? "-translate-y-0.5 scale-110" : "opacity-60 group-hover:opacity-100 group-hover:scale-105"}`}
                    style={{ color: isActive ? BRAND.GREEN : "currentColor" }}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveDot"
                      className="absolute bottom-1 w-1 h-1 rounded-full"
                      style={{ backgroundColor: BRAND.GREEN }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
