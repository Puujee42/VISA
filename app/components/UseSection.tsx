"use client";

import Link from "next/link";
import CountUp from "react-countup";
import Image from "next/image";
import {
  FaUserGraduate,
  FaGlobeEurope,
  FaAward,
  FaHourglassHalf,
  FaArrowRight,
  FaQuoteRight,
  FaCheckCircle,
} from "react-icons/fa";
import { useTranslations } from "next-intl";

const UsSection = () => {
  const t = useTranslations("UsSection");

  const stats = [
    { id: 1, val: 20, suffix: t("years"), label: t("stat_exp"), icon: FaHourglassHalf },
    { id: 2, val: 3000, suffix: "+", label: t("stat_participants"), icon: FaUserGraduate },
    { id: 3, val: 55, suffix: t("years"), label: t("stat_global"), icon: FaGlobeEurope },
    { id: 4, val: 100, suffix: "%", label: t("stat_reliable"), icon: FaAward },
  ];

  return (
    <section className="relative w-full py-16 lg:py-24 overflow-hidden bg-slate-50 selection:bg-red-100 selection:text-red-900">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 90% 10%, rgba(227,27,35,0.07) 0%, transparent 60%)",
        }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col relative">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-[#E31B23]">
                <FaAward size={14} />
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
                {t("badge")}
              </span>
            </div>

            <h2 className="text-3xl lg:text-5xl xl:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
              {t("heading_pre")} <br className="hidden md:block" />
              <span className="inline-block relative">
                <span className="absolute bottom-1 lg:bottom-3 left-0 w-full h-3 lg:h-5 bg-[#00C896]/20 -z-10 -skew-x-6" />
                <span className="text-slate-800">{t("heading_seq1")}</span>
              </span>
              <span className="text-[#E31B23] ml-1">{t("heading_post")}</span>
            </h2>

            <div className="space-y-5 text-base lg:text-lg text-slate-600 leading-relaxed font-medium">
              <p>{t("desc1")}</p>
              <p>{t("desc2")}</p>
            </div>

            <div className="mt-8 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm italic text-slate-700 flex gap-4">
              <div className="text-3xl text-red-200">
                <FaQuoteRight />
              </div>
              <div>
                <p className="relative z-10 font-semibold text-base lg:text-lg">&quot;{t("quote")}&quot;</p>
                <p className="text-xs font-bold text-slate-600 mt-2 uppercase tracking-wide">
                  — {t("founder")}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/contact" className="inline-block group">
                <div className="relative overflow-hidden rounded-full px-8 py-3.5 bg-[#E31B23] text-white font-bold text-base shadow-lg shadow-red-500/25 hover:brightness-110 transition-[filter,transform] hover:-translate-y-0.5">
                  <span className="relative z-10 flex items-center gap-3">
                    {t("cta")}
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div className="relative h-full flex items-center justify-center lg:pt-8">
            <div className="relative z-10 w-full max-w-md mx-auto">
              <div className="relative rounded-[2rem] overflow-hidden shadow-xl shadow-slate-900/15 border-[6px] border-white bg-white">
                <div className="aspect-[3/4] relative group">
                  <Image
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                    alt="Agency Founder"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                      {t("founder")}
                    </p>
                    <p className="text-2xl font-bold">Mongolian AuPair</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-4 md:-right-8 bg-white p-5 rounded-2xl shadow-lg border border-slate-100 max-w-[220px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 text-[#00C896] p-2 rounded-xl">
                    <FaCheckCircle className="text-lg" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase leading-tight">
                    {t("certified")}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-semibold leading-snug">
                  Recognized by international Au Pair associations for safety & quality.
                </p>
              </div>

              <div className="absolute -top-8 -left-6 w-24 h-24 bg-[#E31B23] rounded-full flex items-center justify-center shadow-lg shadow-red-500/25 border-4 border-white z-20">
                <div className="font-black text-xl text-white">20+</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 lg:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={stat.id}
              className="p-6 lg:p-8 rounded-2xl bg-white border border-slate-100 text-center shadow-sm"
            >
              <stat.icon
                className={`text-3xl mx-auto mb-3 ${
                  idx % 2 === 0 ? "text-[#E31B23]" : "text-[#00C896]"
                }`}
              />
              <div className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight mb-1">
                <CountUp end={stat.val} duration={2} enableScrollSpy scrollSpyOnce />
                <span
                  className={`text-xl ml-0.5 ${
                    idx % 2 === 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {stat.suffix}
                </span>
              </div>
              <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UsSection;
