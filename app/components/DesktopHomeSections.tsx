"use client";

import { Link } from "@/navigation";
import { FileText, Users, Plane, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

const STEPS = [
  { key: "step1", icon: FileText, color: "#E31B23", href: "/apply" },
  { key: "step2", icon: Users, color: "#2563EB", href: "/about" },
  { key: "step3", icon: Plane, color: "#00C896", href: "/aupair" },
] as const;

const COUNTRIES = [
  { flag: "🇩🇪", key: "germany", href: "/aupair/germany", accent: "#F59E0B" },
  { flag: "🇦🇹", key: "austria", href: "/aupair/austria", accent: "#F43F5E" },
  { flag: "🇨🇭", key: "switzerland", href: "/aupair/switzerland", accent: "#EF4444" },
  { flag: "🇧🇪", key: "belgium", href: "/aupair/belgium", accent: "#EAB308" },
  { flag: "🇫🇷", key: "france", href: "/aupair/france", accent: "#2563EB" },
] as const;

export function DesktopDestinations() {
  const t = useTranslations("navbar");
  const home = useTranslations("HomePage");

  return (
    <section className="hidden lg:block py-12 xl:py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
              {t("countries")}
            </p>
            <h2 className="text-3xl xl:text-4xl font-black tracking-tight text-slate-900">
              {home("destinationsTitle")}
            </h2>
          </div>
          <Link
            href="/aupair"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#E31B23] hover:gap-3 transition-all"
          >
            {home("viewAll")} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {COUNTRIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 hover:border-slate-200 hover:shadow-[0_12px_40px_-20px_rgba(15,23,42,0.2)] transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5"
            >
              <span className="text-4xl block mb-4">{c.flag}</span>
              <p className="text-sm font-black text-slate-900">{t(c.key)}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-2">
                {t(`desc_${c.key === "germany" ? "de" : c.key === "austria" ? "at" : c.key === "switzerland" ? "ch" : c.key === "belgium" ? "be" : "fr"}`)}
              </p>
              <div
                className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: c.accent }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DesktopHowItWorks() {
  const t = useTranslations("HomePage.howItWorks");

  return (
    <section className="hidden lg:block py-6 pb-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-[2rem] bg-slate-900 text-white px-10 py-12 xl:px-14 xl:py-14 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_90%_10%,rgba(0,200,150,0.18),transparent),radial-gradient(ellipse_40%_40%_at_10%_90%,rgba(227,27,35,0.15),transparent)]" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50 mb-2">
                {t("label")}
              </p>
              <h2 className="text-3xl xl:text-4xl font-black tracking-tight">
                {t("title")}
              </h2>
            </div>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#E31B23] text-white text-sm font-bold hover:brightness-110 transition-[filter,transform] active:scale-[0.98]"
            >
              {t("cta")} <ArrowRight size={15} />
            </Link>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-6">
            {STEPS.map((step, index) => (
              <Link
                key={step.key}
                href={step.href}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white"
                    style={{ background: step.color }}
                  >
                    {index + 1}
                  </span>
                  <step.icon size={18} style={{ color: step.color }} />
                </div>
                <p className="text-lg font-bold mb-1">{t(`${step.key}.title`)}</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  {t(`${step.key}.desc`)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
