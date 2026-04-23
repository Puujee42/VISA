"use client";

import { useRef } from "react";
import { useScroll, useTransform, useSpring, useMotionValue, m } from "framer-motion";
import { useIsMobile, Motion as motion } from "./MotionProxy";
import {
  FaShieldAlt,
  FaHeadset,
  FaWallet,
  FaGlobeEurope,
  FaArrowRight,
  FaCheck,
  FaStar
} from "react-icons/fa";
import { useTranslations } from "next-intl";

/* ────────────────────── SOFT PALETTE ────────────────────── */
const PALETTE = {
  // Switched from harsh standard Red to a Bright Coral/Rose
  BRIGHT_RED: "#F43F5E", // Rose-500
  SOFT_RED_BG: "#FFF1F2", // Rose-50

  // Accents
  TEAL: "#14B8A6",
  DARK: "#1E293B",
  WHITE: "#FFFFFF",
};

const DreamyAtmosphere = ({ containerRef }: { containerRef: React.RefObject<any> }) => {
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityBg = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />

      {/* Soft Pink Orb */}
      <m.div
        style={{ y: yBg, opacity: opacityBg }}
        className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[120px] will-change-transform"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-full h-full bg-gradient-to-br from-rose-200 to-transparent" />
      </m.div>

      {/* Soft Teal Orb */}
      <m.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 50]) }}
        className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[100px] will-change-transform"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div className="w-full h-full bg-gradient-to-bl from-teal-100 to-transparent" />
      </m.div>
    </div>
  );
};

// FIX: Removed dictionary prop as we now use hook
const WhyChooseUs = () => {
  const t = useTranslations("WhyChooseUs");
  const containerRef = useRef(null);
  const isMobile = useIsMobile();

  return (
    <section ref={containerRef} className="py-24 md:py-40 bg-slate-50 relative overflow-hidden selection:bg-rose-200 selection:text-rose-900">

      {/* ─── DREAMY ATMOSPHERE (Bright & Airy) ─── */}
      {!isMobile && <DreamyAtmosphere containerRef={containerRef} />}
      {isMobile && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
          <div className="absolute -top-[10%] -left-[10%] w-[400px] h-[400px] bg-rose-100/20 rounded-full blur-[60px]" />
        </div>
      )}


      <div className="container mx-auto px-6 max-w-7xl relative z-10">

        {/* ─── HEADER ─── */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-rose-100 shadow-sm mb-8 hover:shadow-md transition-shadow cursor-default"
          >
            <FaStar className="text-yellow-400 text-sm" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {t("badge")}
            </span>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
          >
            {t("title_pre")} <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-400">
                {t("title_highlight")}
              </span>
              {/* Soft Underline */}
              <m.svg
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute w-[110%] -bottom-2 -left-[5%] h-3 text-rose-200 z-0"
                viewBox="0 0 100 10" preserveAspectRatio="none"
              >
                <path d="M0 5 Q 50 12 100 5" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
              </m.svg>
            </span>
          </m.h2>

          <m.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto"
          >
            {t("desc")}
          </m.p>
        </div>

        {/* ─── AESTHETIC GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-auto">

          {/* 1. GLOBAL CONNECT (White Glass) */}
          <AestheticCard className="md:col-span-2 md:row-span-2 bg-white/70">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-teal-50 to-transparent rounded-full blur-3xl -z-10 opacity-60" />

            <div className="p-8 h-full flex flex-col justify-between z-10">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-teal-100 border border-teal-50">
                    <FaGlobeEurope size={32} className="text-teal-400" />
                  </div>
                  {/* Animated Planes */}
                  <div className="relative w-24 h-24 opacity-20">
                    <m.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-dashed border-slate-400 rounded-full"
                    />
                    <FaGlobeEurope className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-slate-800 mb-3">{t("card1_title")}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-lg">
                  {t("card1_desc")}
                </p>
              </div>

              <div className="flex gap-2 mt-8 flex-wrap">
                {["🇩🇪 Germany", "🇧🇪 Belgium", "🇫🇷 France", "🇦🇹 Austria"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-white border border-slate-100 text-slate-600 text-xs font-bold shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </AestheticCard>

          {/* 2. SUPPORT (Bright Red Accent - NOT Dark) */}
          <AestheticCard className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-white to-rose-50/50">
            <div className="p-8 h-full flex flex-col items-center text-center justify-center z-10">

              {/* Floating Avatar Group */}
              <m.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-8 relative"
              >
                <div className="w-24 h-24 rounded-full bg-white p-2 shadow-xl shadow-rose-100">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-400 to-orange-400 flex items-center justify-center text-white">
                    <FaHeadset size={40} />
                  </div>
                </div>
                {/* Chat Bubble */}
                <m.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-4 px-3 py-1 bg-white rounded-xl shadow-md text-[10px] font-bold text-rose-500 border border-rose-100"
                >
                  Hi there! 👋
                </m.div>
              </m.div>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">{t("card2_title")}</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                {t("card2_desc")}
              </p>

              <button className="w-full py-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-200 transition-all font-bold text-sm">
                {t("card2_btn")}
              </button>
            </div>
          </AestheticCard>

          {/* 3. COST (Minimalist) */}
          <AestheticCard className="md:col-span-1 md:row-span-1 bg-white">
            <div className="p-8 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                  <FaWallet size={24} />
                </div>
                <div className="px-2 py-1 bg-amber-100/50 text-amber-700 text-[10px] font-bold rounded-lg">
                  TRANSPARENT
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{t("card3_title")}</h3>
                <p className="text-slate-600 text-xs font-medium">{t("card3_desc")}</p>
              </div>
            </div>
          </AestheticCard>

          {/* 4. SAFETY (White with Soft Red Shield) */}
          <AestheticCard className="md:col-span-2 md:row-span-1 bg-white">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-400 to-rose-200" />

            <div className="p-8 h-full flex items-center justify-between z-10">
              <div className="max-w-xs">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-3 text-slate-900">
                  <FaShieldAlt className="text-rose-500" /> {t("card4_title")}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {t("card4_desc")}
                </p>
              </div>

              <div className="hidden md:flex gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600"><FaCheck size={10} /></div> Verified Profile
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600"><FaCheck size={10} /></div> Background Check
                  </div>
                </div>
              </div>
            </div>
          </AestheticCard>

          {/* 5. CTA (Gradient Border Effect) */}
          <AestheticCard className="md:col-span-2 md:row-span-1 bg-slate-900 group cursor-pointer overflow-hidden">
            {/* Animated Gradient Background on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

            <div className="relative p-8 h-full flex items-center justify-between z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white/10 group-hover:bg-white group-hover:text-rose-600 text-white flex items-center justify-center transition-all duration-300 shadow-sm backdrop-blur-sm">
                  <FaArrowRight size={20} className="group-hover:-rotate-45 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">
                    {t("card5_title")}
                  </h3>
                  <p className="text-slate-600 text-sm font-medium mt-1">
                    {t("card5_desc")}
                  </p>
                </div>
              </div>
            </div>
          </AestheticCard>

        </div>
      </div>
    </section>
  );
};

/* ────────────────────── AESTHETIC CARD COMPONENT ────────────────────── */

const AestheticCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Very soft springs for that "floating in jelly" feel
  const mouseX = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const width = rect.width;
      const height = rect.height;
      const mouseXVal = e.clientX - rect.left;
      const mouseYVal = e.clientY - rect.top;

      const xPct = mouseXVal / width - 0.5;
      const yPct = mouseYVal / height - 0.5;

      x.set(xPct * 8); // Rotate Y axis
      y.set(yPct * -8); // Rotate X axis
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY: mouseX,
        rotateX: mouseY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`
        relative rounded-[2rem] 
        border border-white/50 
        shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] 
        hover:shadow-[0_20px_50px_-10px_rgba(244,63,94,0.1)] 
        transition-all duration-500 
        backdrop-blur-xl
        overflow-hidden
        ${className}
      `}
    >
      <div style={{ transform: "translateZ(30px)" }} className="h-full">
        {children}
      </div>
    </m.div>
  );
};

export default WhyChooseUs;