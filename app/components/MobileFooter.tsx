"use client";

import { Link } from "@/navigation";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MobileFooter() {
  const t = useTranslations("Footer");
  const nav = useTranslations("navbar");
  const common = useTranslations("common");
  const home = useTranslations("HomePage");

  const quickLinks = [
    { label: nav("about"), href: "/about" },
    { label: nav("program"), href: "/aupair" },
    { label: nav("register"), href: "/apply" },
    { label: nav("events"), href: "/events" },
    { label: nav("lessons"), href: "/lessons" },
    { label: nav("contact"), href: "/contact" },
  ];

  return (
    <footer className="lg:hidden relative w-full mt-6 pb-[calc(var(--app-bottom-nav-height)+env(safe-area-inset-bottom,0px)+16px)]">
      <div className="mx-3 app-card-strong p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-black/5">
            <Image src="/image.png" alt="Logo" fill sizes="40px" className="object-cover" />
          </div>
          <div>
            <p className="text-base font-black text-slate-900">{nav("logo")}</p>
            <p className="text-[11px] font-semibold text-[var(--brand-green)] uppercase tracking-wider">
              {home("tagline")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2.5 rounded-xl bg-slate-50 text-[13px] font-semibold text-slate-700 active:bg-slate-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="space-y-2 mb-5">
          <a href="tel:+97677116906" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/80">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Phone size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{common("phone")}</p>
              <p className="text-sm font-bold text-slate-800">+976 7711 6906</p>
            </div>
          </a>
          <a href="mailto:info@mongolianaupair.com" className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/80">
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-[#E31B23]">
              <Mail size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-slate-400">{common("email")}</p>
              <p className="text-sm font-bold text-slate-800 truncate">info@mongolianaupair.com</p>
            </div>
          </a>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/80">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-[#00C896]">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">{common("address")}</p>
              <p className="text-sm font-bold text-slate-800">Ulaanbaatar, Mongolia</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t("rights")}
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-transform"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
