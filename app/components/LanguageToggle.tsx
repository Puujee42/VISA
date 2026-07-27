"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";

const LANGUAGES = [
  { code: "mn", name: "Монгол", flag: "🇲🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

export default function LanguageToggle({ variant = "auto" }: { variant?: "auto" | "light" | "dark" }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const isLight = variant === "light";

  const handleLanguageChange = (newLocale: string) => {
    setIsOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all active:scale-95 text-xs font-semibold ${
          isLight
            ? "bg-white/15 hover:bg-white/25 border border-white/25 text-white backdrop-blur-md"
            : "bg-black/[0.04] hover:bg-black/[0.07] border border-black/[0.06] text-slate-700"
        }`}
      >
        <span className="text-base leading-none">{currentLanguage.flag}</span>
        <ChevronDown size={12} className={`opacity-70 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <m.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-1"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors
                    ${locale === lang.code 
                      ? "bg-slate-900 text-white" 
                      : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {locale === lang.code && <Check size={14} className="text-emerald-400" />}
                </button>
              ))}
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}