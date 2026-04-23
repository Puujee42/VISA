"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll, useTransform, Variants, useSpring, m } from "framer-motion";
import { useIsMobile, Motion as motion } from "./MotionProxy";
import CountUp from "react-countup";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import {
  FaUserGraduate,
  FaGlobeEurope,
  FaAward,
  FaHourglassHalf,
  FaArrowRight,
  FaQuoteRight,
  FaCheckCircle
} from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";

/* ────────────────────── Design System ────────────────────── */
const COLORS = {
  RED: "#E31B23",
  GREEN: "#00C896",
  DARK: "#0F172A",
  SLATE: "#64748B",
};

const ParallaxBackground = ({ containerRef }: { containerRef: React.RefObject<any> }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const yBackground = useSpring(useTransform(scrollYProgress, [0, 1], [0, 150]), springConfig);

  return (
    <m.div
      style={{ y: yBackground }}
      className="absolute -top-[20%] -right-[10%] w-[1000px] h-[1000px] bg-gradient-to-b from-red-100/40 via-orange-50/20 to-transparent rounded-full blur-[100px] mix-blend-multiply"
    />
  );
};

const UsSection = () => {
  const t = useTranslations("UsSection");
  const locale = useLocale();
  const containerRef = useRef(null);
  const isMobile = useIsMobile();

  // ─── Parallax & Scroll Hooks (Desktop only) ───
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const yImage = useSpring(useTransform(scrollYProgress, [0, 1], [50, -50]), springConfig);
  const rotateImage = useTransform(scrollYProgress, [0, 1], [-3, 3]);

  // ─── Content Strategy ───
  const stats = [
    { id: 1, val: 20, suffix: t("years"), label: t("stat_exp"), icon: FaHourglassHalf },
    { id: 2, val: 3000, suffix: "+", label: t("stat_participants"), icon: FaUserGraduate },
    { id: 3, val: 55, suffix: t("years"), label: t("stat_global"), icon: FaGlobeEurope },
    { id: 4, val: 100, suffix: "%", label: t("stat_reliable"), icon: FaAward },
  ];

  const headingSequence = [
    t("heading_seq1"), 2500,
    t("heading_seq2"), 2500,
    t("heading_seq3"), 2500
  ];

  // ─── Animation Variants ───
  const containerVar: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: isMobile ? 0.05 : 0.15, delayChildren: 0.2 } }
  };

  const textVar: Variants = {
    hidden: { opacity: 0, x: isMobile ? -10 : -30 },
    visible: { opacity: 1, x: 0, transition: { duration: isMobile ? 0.5 : 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const cardVar: Variants = {
    hidden: { opacity: 0, y: isMobile ? 20 : 40 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 20 } }
  };

  return (
    <section ref={containerRef} className="relative w-full py-24 lg:py-32 overflow-hidden bg-slate-50 selection:bg-red-100 selection:text-red-900">

      {/* ────────────────── 1. AMBIENT BACKGROUND ────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-soft-light" />

        {/* Parallax Background - Only Desktop */}
        {!isMobile && <ParallaxBackground containerRef={containerRef} />}

        {/* Static Orb for Mobile */}
        {isMobile && (
          <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-red-100/20 rounded-full blur-[80px]" />
        )}
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ────────────────── 2. LEFT: NARRATIVE CONTENT ────────────────── */}
          <m.div
            variants={containerVar}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col relative"
          >
            {/* Badge */}
            <m.div variants={textVar} className="mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-[#E31B23]">
                <FaAward size={14} />
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-500 font-sans">
                {t("badge")}
              </span>
            </m.div>

            {/* Headline with TypeAnimation */}
            <m.h2 variants={textVar} className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-8 min-h-[3.3em] lg:min-h-[2.5em]">
              {t("heading_pre")} <br className="hidden md:block" />
              <span className="inline-block relative">
                {/* Highlighter Effect */}
                <m.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: isMobile ? 0.2 : 0.5, duration: 0.8 }}
                  className="absolute bottom-1 lg:bottom-3 left-0 w-full h-3 lg:h-5 bg-[#00C896]/20 -z-10 origin-left -skew-x-6"
                />
                <TypeAnimation
                  key={locale}
                  sequence={headingSequence}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600"
                />
              </span>
              <span className="text-[#E31B23] ml-1">{t("heading_post")}</span>
            </m.h2>

            {/* Paragraphs */}
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
              <m.p variants={textVar} className="border-l-2 border-transparent hover:border-slate-300 pl-0 hover:pl-6 transition-all duration-300">
                {t("desc1")}
              </m.p>
              <m.p variants={textVar} className="border-l-2 border-transparent hover:border-slate-300 pl-0 hover:pl-6 transition-all duration-300">
                {t("desc2")}
              </m.p>
            </div>

            {/* Quote Box */}
            <m.div variants={textVar} className="mt-10 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm relative italic text-slate-700 flex gap-4">
              <div className="text-4xl text-red-200"><FaQuoteRight /></div>
              <div>
                <p className="relative z-10 font-semibold text-lg">"{t("quote")}"</p>
                <p className="text-xs font-bold text-slate-600 mt-2 uppercase tracking-wide">— {t("founder")}</p>
              </div>
            </m.div>

            {/* CTA Button */}
            <m.div variants={textVar} className="mt-12">
              <Link href="/contact" className="inline-block group">
                <div className="relative overflow-hidden rounded-full px-10 py-4 bg-[#E31B23] text-white font-bold text-lg shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 transition-all duration-300 transform hover:-translate-y-1">
                  <span className="relative z-10 flex items-center gap-3">
                    {t("cta")}
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Button Shine */}
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
                </div>
              </Link>
            </m.div>
          </m.div>

          {/* ────────────────── 3. RIGHT: VISUAL COMPOSITION ────────────────── */}
          <div className="relative h-full flex items-center justify-center lg:pt-12 perspective-[1000px]">

            {/* Main Image Layer */}
            <m.div
              style={isMobile ? {} : { rotate: rotateImage, y: yImage }}
              initial={{ opacity: 0, y: 50, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative z-10 w-full max-w-md mx-auto"
            >
              {/* Image Frame */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/20 border-[8px] border-white bg-white">
                <div className="aspect-[3/4] relative group">
                  {/* Using a professional business image from Unsplash */}
                  <Image
                    src="https://res.cloudinary.com/dc127wztz/image/upload/v1768996172/zu47lypqyoup0ylylou2.webp"
                    alt="Agency Founder"
                    fill
                    className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />

                  {/* Name Tag on Image */}
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{t("founder")}</p>
                    <p className="text-2xl font-bold">Mongolian AuPair</p>
                  </div>
                </div>
              </div>

              {/* Floating Glass Element - Stats/Experience */}
              <m.div
                animate={isMobile ? {} : { y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -right-8 md:-right-12 bg-white/90 backdrop-blur-md p-6 rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white/60 max-w-[240px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 text-[#00C896] p-2.5 rounded-xl">
                    <FaCheckCircle className="text-xl" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase leading-tight">{t("certified")}</span>
                </div>
                <p className="text-sm text-slate-600 font-semibold leading-snug">
                  Recognized by international Au Pair associations for safety & quality.
                </p>
              </m.div>

              {/* Floating Decorative Stamp (Spinning Text) */}
              <m.div
                animate={{ rotate: 360 }}
                transition={{ duration: isMobile ? 60 : 25, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -left-10 w-32 h-32 bg-[#E31B23] rounded-full flex items-center justify-center shadow-xl shadow-red-500/30 border-4 border-white z-20"
              >
                {/* SVG Curve Text */}
                <div className="absolute w-full h-full p-1 animate-spin-slow">
                  <svg viewBox="0 0 100 100" width="100%" height="100%" className="fill-white font-bold tracking-widest uppercase text-[11px]">
                    <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                    <text>
                      <textPath xlinkHref="#curve">
                        Since 2005 • Trusted Agency •
                      </textPath>
                    </text>
                  </svg>
                </div>
                <div className="font-black text-3xl text-white">20</div>
              </m.div>

            </m.div>
          </div>
        </div>

        {/* ────────────────── 4. STATS BAR ────────────────── */}
        <m.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: isMobile ? 0.05 : 0.1, delayChildren: 0.2 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat: any, idx: number) => (
            <m.div
              key={stat.id}
              variants={cardVar}
              whileHover={!isMobile ? { y: -8 } : {}}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 group cursor-default text-center relative overflow-hidden"
            >
              <stat.icon
                className={`text-4xl mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${idx % 2 === 0 ? 'text-[#E31B23]' : 'text-[#00C896]'
                  }`}
              />

              <div className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tight mb-2">
                <CountUp end={stat.val} duration={2.5} enableScrollSpy scrollSpyOnce />
                <span className={`text-2xl ml-0.5 ${idx % 2 === 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {stat.suffix}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-slate-800 transition-colors">
                {stat.label}
              </p>
            </m.div>
          ))}
        </m.div>

      </div>
    </section>
  );
};

export default UsSection;