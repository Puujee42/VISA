"use client";

import {
  FaShieldAlt,
  FaHeadset,
  FaWallet,
  FaGlobeEurope,
  FaArrowRight,
  FaCheck,
  FaStar,
} from "react-icons/fa";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

const WhyChooseUs = () => {
  const t = useTranslations("WhyChooseUs");

  return (
    <section
      style={{ background: "linear-gradient(180deg, #FAFFFE 0%, #F8F8FF 50%, #FFFAF8 100%)" }}
      className="py-16 md:py-24 relative overflow-hidden selection:bg-rose-200 selection:text-rose-900"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-5%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "-5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-rose-100 shadow-sm mb-6">
            <FaStar className="text-yellow-400 text-sm" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {t("badge")}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-5 tracking-tight">
            {t("title_pre")} <br />
            <span className="relative inline-block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-400">
              {t("title_highlight")}
            </span>
          </h2>

          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            {t("desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <AestheticCard className="md:col-span-2 md:row-span-2">
            <div className="p-7 h-full flex flex-col justify-between z-10">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-md border border-teal-50">
                    <FaGlobeEurope size={28} className="text-teal-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{t("card1_title")}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {t("card1_desc")}
                </p>
              </div>
              <div className="flex gap-2 mt-6 flex-wrap">
                {["🇩🇪 Germany", "🇧🇪 Belgium", "🇫🇷 France", "🇦🇹 Austria"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white border border-slate-100 text-slate-600 text-xs font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </AestheticCard>

          <AestheticCard className="md:col-span-1 md:row-span-2" style={{ background: "rgba(227, 27, 35, 0.04)" }}>
            <div className="p-7 h-full flex flex-col items-center text-center justify-center z-10">
              <div className="mb-6 w-20 h-20 rounded-full bg-white p-2 shadow-lg shadow-rose-100">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-400 to-orange-400 flex items-center justify-center text-white">
                  <FaHeadset size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t("card2_title")}</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">{t("card2_desc")}</p>
              <Link
                href="/contact"
                className="w-full py-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors font-bold text-sm text-center"
              >
                {t("card2_btn")}
              </Link>
            </div>
          </AestheticCard>

          <AestheticCard className="md:col-span-1 md:row-span-1 bg-white">
            <div className="p-7 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                  <FaWallet size={22} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{t("card3_title")}</h3>
                <p className="text-slate-600 text-xs font-medium">{t("card3_desc")}</p>
              </div>
            </div>
          </AestheticCard>

          <AestheticCard className="md:col-span-2 md:row-span-1 bg-white">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-400 to-rose-200" />
            <div className="p-7 h-full flex items-center justify-between z-10">
              <div className="max-w-xs">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-3 text-slate-900">
                  <FaShieldAlt className="text-rose-500" /> {t("card4_title")}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{t("card4_desc")}</p>
              </div>
              <div className="hidden md:flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <FaCheck size={10} />
                  </div>
                  Verified Profile
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <FaCheck size={10} />
                  </div>
                  Background Check
                </div>
              </div>
            </div>
          </AestheticCard>

          <Link href="/apply" className="md:col-span-2 md:row-span-1 block">
            <AestheticCard
              className="h-full group cursor-pointer"
              style={{ background: "rgba(15, 23, 42, 0.92)" }}
            >
              <div className="relative p-7 h-full flex items-center justify-between z-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-white/10 group-hover:bg-white group-hover:text-rose-600 text-white flex items-center justify-center transition-colors">
                    <FaArrowRight size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t("card5_title")}</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">{t("card5_desc")}</p>
                  </div>
                </div>
              </div>
            </AestheticCard>
          </Link>
        </div>
      </div>
    </section>
  );
};

function AestheticCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.25rem] border border-slate-100/80 bg-white/90 ${className || ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default WhyChooseUs;
