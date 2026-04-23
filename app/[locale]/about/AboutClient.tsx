"use client";

import React, { useRef } from "react";
import Image from "next/image";
import {
  m,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  Variants
} from "framer-motion";
import { FaStar, FaGlobeEurope, FaCertificate, FaHeart, FaUserGraduate, FaPassport } from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";

// --- ANIMATION VARIANTS ---
const containerVar: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemVar: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.4, duration: 0.9 }
  }
};

export default function AboutPageRed() {
  const t = useTranslations("About");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

  // Parallax effects
  const yHero = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);

  // Map icons for cards
  const icons = [FaUserGraduate, FaCertificate, FaGlobeEurope, FaPassport];

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100dvh] bg-white overflow-hidden py-32 font-sans selection:bg-[#D93644] selection:text-white"
    >

      {/* ─── 1. WARM RED ATMOSPHERE ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dominant Red Blob Top Right */}
        <m.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] right-[-10%] w-[900px] h-[900px] bg-gradient-to-br from-rose-100 via-[#D93644]/10 to-transparent rounded-full blur-[100px] opacity-80"
        />
        {/* Secondary Emerald/Rose Mix Bottom Left */}
        <m.div
          animate={{
            x: [0, -70, 30, 0],
            y: [0, 60, -40, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[-15%] w-[800px] h-[800px] bg-gradient-to-tr from-[#D93644]/20 via-rose-100 to-emerald-50 rounded-full blur-[100px]"
        />
        {/* Grain Texture for that 'Editorial' look */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] mix-blend-overlay" />
      </div>

      <div className="container relative z-10 px-6 mx-auto max-w-7xl">

        {/* ─── 2. HERO SECTION ─── */}
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center mb-32">

          {/* Text Content */}
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVar}
            style={{ y: textY }}
            className="space-y-10 relative pt-10"
          >
            {/* Tagline */}
            <m.div variants={itemVar} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/90 border border-red-100 shadow-[0_4px_20px_-10px_rgba(217,54,68,0.3)] backdrop-blur-md">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D93644] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D93644]"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#D93644]">{t("tag")}</span>
            </m.div>

            {/* Title with Red Dominance */}
            <m.h1 variants={itemVar} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] text-slate-900 drop-shadow-sm">
              <span className="block text-slate-300 relative z-10">
                {t("heroTitle")}
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#D93644] via-rose-500 to-emerald-500 filter drop-shadow-sm">
                {t("heroHighlight")}
              </span>
              <span className="block text-2xl md:text-4xl font-serif italic text-slate-400 mt-4 font-normal">
                {t("heroSubtitle")}
              </span>
            </m.h1>

            <m.p variants={itemVar} className="text-xl font-medium text-slate-600 leading-relaxed border-l-[6px] border-rose-300 pl-8 max-w-lg">
              {t("intro")}
            </m.p>

            {/* Stats Counter */}
            <m.div variants={itemVar} className="grid grid-cols-2 gap-y-10 gap-x-12 pt-4">
              {[
                { val: "20", label: t("stat_years"), sub: t("stat_exp") },
                { val: "3000+", label: t("stat_participants"), sub: t("stat_success") }
              ].map((stat, i) => (
                <div key={i} className="group">
                  <div className="text-6xl font-black text-slate-900 group-hover:text-[#D93644] transition-colors duration-500 relative inline-block">
                    {stat.val}
                    {/* Sparkle Icon */}
                    <FaStar className="absolute -top-2 -right-6 text-2xl text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2 group-hover:text-emerald-600 transition-colors">
                    {stat.label} <span className="opacity-50 mx-1 text-red-300">|</span> {stat.sub}
                  </div>
                </div>
              ))}
            </m.div>
          </m.div>

          {/* Hero Image */}
          <div className="relative">
            {/* Curtain Reveal Image */}
            <m.div
              style={{ y: yHero }}
              initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
              whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              // Changed Shadow & Border to Red/Rose tones
              className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-rose-900/20 border-[8px] border-white bg-white aspect-[4/5] w-full"
            >
              <div className="relative w-full h-full group">
                <Image
                  src="https://res.cloudinary.com/dc127wztz/image/upload/v1768996172/zu47lypqyoup0ylylou2.webp"
                  alt="Mongolian Youth"
                  fill
                  className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                />
                {/* Warm Red Tint Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent opacity-60 mix-blend-multiply" />
              </div>
            </m.div>

            {/* Rotating Badge - "Established 2005" */}
            <m.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 -right-6 md:-right-12 z-20 w-40 h-40 flex items-center justify-center bg-white rounded-full shadow-2xl border-[6px] border-rose-50"
            >
              <svg viewBox="0 0 100 100" width="150" height="150" className="animate-spin-slow absolute">
                <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                <text className="text-[12px] font-bold uppercase tracking-widest fill-[#D93644]">
                  <textPath href="#curve">
                    Mongolian Au Pair Agency • 2005 •
                  </textPath>
                </text>
              </svg>
              <div className="relative z-10 flex flex-col items-center leading-none">
                <span className="text-4xl font-black text-slate-900">20</span>
                <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider">{t("yearsLabel")}</span>
              </div>
            </m.div>
          </div>
        </div>

        {/* ─── 3. STORY SECTION ─── */}
        <div className="grid lg:grid-cols-12 gap-12 mb-32 items-start">

          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 relative"
          >
            {/* Sticky Heading */}
            <div className="sticky top-32 space-y-6">
              <div className="w-20 h-1.5 bg-gradient-to-r from-[#D93644] to-rose-400 rounded-full" />
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                {t("storyTitle")}
              </h2>

              {/* Secondary Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                {[
                  { val: "14", label: t("stat_iapa"), sub: t("stat_iapa_sub") },
                  { val: "55", label: t("stat_intl"), sub: t("stat_intl_sub") }
                ].map((stat, i) => (
                  <div key={i}>
                    <h4 className="text-4xl font-black text-[#D93644]">{stat.val}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-rose-50 shadow-[0_20px_60px_-15px_rgba(217,54,68,0.1)] space-y-6"
          >
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-medium">
              {t("storyP1")}
            </p>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-light">
              {t("storyP2")}
            </p>

            <div className="pt-6">
              <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-white border border-red-100">
                <div className="p-3 bg-white rounded-xl text-[#D93644] shadow-sm">
                  <FaCertificate size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{t("iapa_member")}</h4>
                  <p className="text-sm text-red-500/80 font-medium">{t("iapa_full")}</p>
                </div>
              </div>
            </div>
          </m.div>
        </div>

        {/* ─── 4. VALUES (Red-Themed 3D Grid) ─── */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t("valuesTitle")}</h2>
            {/* Gradient Divider: Red to Emerald */}
            <div className="w-32 h-1.5 bg-gradient-to-r from-[#D93644] via-rose-400 to-emerald-400 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[0, 1, 2, 3].map((i) => (
              <RedTiltCard
                key={i}
                icon={icons[i]}
                title={t(`card${i + 1}_title`)}
                text={t(`card${i + 1}_text`)}
                index={i}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── 3D MAGNETIC CARD (Red Dominant) ───
interface CardProps {
  icon: any;
  title: string;
  text: string;
  index: number;
}

const RedTiltCard = ({ icon: Icon, title, text, index }: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const glareX = useTransform(xSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(ySpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Logic: 3 cards Red-themed, 1 card Emerald-themed for accent
  const isRed = index !== 1; // Arbitrary pattern for variety

  return (
    <m.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`group relative min-h-[240px] p-10 rounded-[2.5rem] bg-white border shadow-xl cursor-pointer perspective-1000 overflow-hidden
        ${isRed
          ? "border-red-50 hover:border-red-200 shadow-rose-100/50"
          : "border-emerald-50 hover:border-emerald-200 shadow-emerald-100/50"}`}
    >
      {/* Dynamic Glare */}
      <m.div
        style={{ background: useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.8), transparent 50%)` }}
        className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-20 mix-blend-overlay"
      />

      <div style={{ transform: "translateZ(30px)" }} className="relative z-10 h-full flex flex-col items-start">
        {/* Icon Box */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6
          ${isRed
            ? "bg-rose-50 text-[#D93644] group-hover:bg-[#D93644] group-hover:text-white"
            : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"}`}>
          <Icon size={28} />
        </div>

        <h3 className={`text-xl font-black mb-3 group-hover:translate-x-1 transition-transform
           ${isRed ? "text-slate-900" : "text-slate-900"}`}>
          {title}
        </h3>

        <p className="text-sm text-slate-500 font-medium leading-relaxed mt-auto">
          {text}
        </p>
      </div>

      {/* Decorative Blob in corner */}
      <div className={`absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-[70px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-0
         ${isRed ? "bg-[#D93644]" : "bg-emerald-500"}`}
      />
    </m.div>
  );
};
