"use client";

import React from "react";
import { m } from "framer-motion";
import {
  Globe,
  Rocket,
  Smartphone,
  ShieldCheck,
  Star,
  ArrowRight
} from "lucide-react";
import { useTranslations } from "next-intl";

const BeforeLoginNews = () => {
  const t = useTranslations("BeforeLoginNews");

  const features = [
    {
      icon: Rocket,
      iconColor: "text-emerald-500",
      title: t("simple_title"),
      desc: t("simple_desc")
    },
    {
      icon: Smartphone,
      iconColor: "text-blue-500",
      title: t("flex_title"),
      desc: t("flex_desc")
    },
    {
      icon: ShieldCheck,
      iconColor: "text-emerald-600",
      title: t("security_title"),
      desc: t("security_desc")
    },
    {
      icon: Globe,
      iconColor: "text-orange-500",
      title: t("free_title"),
      desc: t("free_desc")
    }
  ];

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 w-full max-w-[480px] h-[650px] bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 flex flex-col overflow-hidden"
    >
      {/* Gloss Shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-80 pointer-events-none" />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Star size={12} fill="currentColor" />
          <span>{t("badge")}</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 leading-[1.1] tracking-tight">
          {t("header")} 🌍
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-4 space-y-8 custom-scrollbar relative z-10">
        <p className="text-slate-600 font-bold text-sm leading-relaxed">
          {t.rich("subheader", {
            strong: (chunks) => <strong>{chunks}</strong>
          })}
        </p>

        {features.map((feature, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-12 h-12 shrink-0 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
              <feature.icon className={feature.iconColor} size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-8 pt-6 border-t border-white/40 relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {t("ready")}
          </p>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest animate-pulse">
            {t("scroll")} <ArrowRight size={12} />
          </div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
    </m.div>
  );
};

export default BeforeLoginNews;
