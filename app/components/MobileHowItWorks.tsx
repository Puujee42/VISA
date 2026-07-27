"use client";

import { FileText, Users, Plane } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

const STEPS = [
  { key: "step1", icon: FileText, color: "#E31B23", href: "/apply" },
  { key: "step2", icon: Users, color: "#2563EB", href: "/about" },
  { key: "step3", icon: Plane, color: "#00C896", href: "/aupair" },
] as const;

export default function MobileHowItWorks() {
  const t = useTranslations("HomePage.howItWorks");

  return (
    <section className="lg:hidden px-4 py-6">
      <div className="app-card p-5">
        <p className="mobile-section-label">{t("label")}</p>
        <h2 className="mobile-section-title mb-5">{t("title")}</h2>

        <div className="space-y-3">
          {STEPS.map((step, index) => (
            <Link
              key={step.key}
              href={step.href}
              className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/80 border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm"
                style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-slate-900 leading-tight">
                  {t(`${step.key}.title`)}
                </p>
                <p className="text-[13px] text-slate-500 mt-0.5 leading-snug">
                  {t(`${step.key}.desc`)}
                </p>
              </div>
              <step.icon size={18} style={{ color: step.color }} className="shrink-0 opacity-70" />
            </Link>
          ))}
        </div>

        <Link
          href="/apply"
          className="hero-mobile-cta mt-4 text-center"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}
