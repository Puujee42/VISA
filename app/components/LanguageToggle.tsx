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

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const handleLanguageChange = (newLocale: string) => {
    setIsOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all active:scale-95 text-sm font-bold shadow-sm"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="uppercase">{currentLanguage.code}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
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