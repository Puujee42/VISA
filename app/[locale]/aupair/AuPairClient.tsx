"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
   m,
   useScroll,
   useTransform,
   useSpring,
   useMotionValue,
   useMotionTemplate,
   Variants
} from "framer-motion";
import {
   FaGlobeEurope,
   FaPassport,
   FaHandshake,
   FaLanguage,
   FaPlaneDeparture,
   FaMoneyBillWave,
   FaUniversity,
   FaUsers,
   FaShieldAlt,
   FaFileContract
} from "react-icons/fa";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

// --- COLOR PALETTE ---
const THEME = {
   red: "#D93644",
   emerald: "#10B981",
   dark: "#052e16", // Dark Emerald for text
};

// --- ANIMATION VARIANTS ---
const containerVar: Variants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const fadeUp: Variants = {
   hidden: { opacity: 0, y: 40 },
   visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
};

export default function AuPairPage() {
   const t = useTranslations("AuPair");
   const containerRef = useRef<HTMLDivElement>(null);
   const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

   const yHero = useTransform(scrollYProgress, [0, 1], [0, -100]);
   const rotateHero = useTransform(scrollYProgress, [0, 1], [0, 10]);

   const stats = [
      { val: "20", label: t("stat_years"), sub: t("stat_exp") },
      { val: "3000+", label: t("stat_participants"), sub: t("stat_success") },
      { val: "55", label: t("stat_intl_hist"), sub: t("stat_intl_hist_sub") },
      { val: "14", label: t("stat_iapa_years"), sub: t("stat_iapa_member") },
   ];

   const benefits = [
      { icon: FaGlobeEurope, title: t("benefit1_title"), desc: t("benefit1_desc") },
      { icon: FaLanguage, title: t("benefit2_title"), desc: t("benefit2_desc") },
      { icon: FaPlaneDeparture, title: t("benefit3_title"), desc: t("benefit3_desc") },
      { icon: FaMoneyBillWave, title: t("benefit4_title"), desc: t("benefit4_desc") },
      { icon: FaUniversity, title: t("benefit5_title"), desc: t("benefit5_desc") },
      { icon: FaUsers, title: t("benefit6_title"), desc: t("benefit6_desc") },
   ];

   const steps = [
      { id: "01", title: t("step1_title"), desc: t("step1_desc") },
      { id: "02", title: t("step2_title"), desc: t("step2_desc") },
      { id: "03", title: t("step3_title"), desc: t("step3_desc") },
      { id: "04", title: t("step4_title"), desc: t("step4_desc") },
      { id: "05", title: t("step5_title"), desc: t("step5_desc") },
   ];

   return (
      <div ref={containerRef} className="bg-white text-slate-800 font-sans selection:bg-[#D93644] selection:text-white overflow-hidden">

         {/* ─── 1. ATMOSPHERIC BACKGROUND ─── */}
         <div className="fixed inset-0 pointer-events-none z-0">
            <m.div
               animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-[100px]"
            />
            <m.div
               animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }}
               transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
               className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-rose-100/60 to-transparent rounded-full blur-[100px]"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] mix-blend-overlay" />
         </div>

         {/* ─── 2. HERO SECTION ─── */}
         <section className="relative z-10 pt-40 pb-20 px-6" aria-labelledby="aupair-hero-title">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
               <m.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={containerVar}
                  className="space-y-8"
               >
                  <m.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-100 shadow-sm">
                     <div className="w-2 h-2 bg-[#D93644] rounded-full animate-pulse" />
                     <span className="text-xs font-black uppercase tracking-widest text-emerald-800">{t("cultureExchange")}</span>
                  </m.div>

                  <m.h1 id="aupair-hero-title" variants={fadeUp} className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-slate-900">
                     <span className="block">{t("heroTitlePrefix")}</span>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-[#10B981] to-[#D93644]">
                        {t("heroTitleHighlight")}
                     </span>
                  </m.h1>

                  <m.p variants={fadeUp} className="text-xl text-slate-600 font-medium leading-relaxed max-w-lg border-l-4 border-[#D93644] pl-6">
                     {t("heroSub")}
                  </m.p>

                  <m.div variants={fadeUp} className="flex flex-wrap gap-4 pt-4">
                     <button className="px-8 py-4 rounded-full bg-[#D93644] text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-rose-500/30 hover:bg-rose-600 hover:scale-105 transition-all">
                        {t("cta")}
                     </button>
                     <button className="px-8 py-4 rounded-full bg-white text-slate-800 border border-slate-200 font-bold text-sm uppercase tracking-widest hover:border-emerald-400 hover:text-emerald-600 transition-all">
                        {t("more")}
                     </button>
                  </m.div>
               </m.div>

               {/* Hero Visual */}
               <div className="relative h-[600px] hidden lg:block perspective-1000">
                  <m.div style={{ y: yHero, rotate: rotateHero }} className="absolute inset-0 z-10">
                     <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-[8px] border-white shadow-2xl bg-slate-100">
                        <Image
                           src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                           alt="Mongolian au pair participants enjoying cultural exchange in Europe — happy young people from diverse backgrounds" fill className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent mix-blend-multiply" />

                        <div className="absolute bottom-8 left-8 text-white max-w-xs">
                           <p className="font-serif italic text-2xl mb-2">"Equality & Opportunity"</p>
                           <p className="text-sm opacity-80">Au Pair = {t("whatIsEqualRights")}</p>
                        </div>
                     </div>
                  </m.div>

                  {/* Decorative Circle */}
                  <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-400 rounded-full blur-[80px] opacity-40 z-0" />
               </div>
            </div>
         </section>

         {/* ─── 3. STATS STRIP ─── */}
         <section className="py-12 border-y border-dashed border-slate-200 bg-white/50 backdrop-blur-sm relative z-20" aria-label="Au Pair program statistics">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
               {stats.map((stat, i) => (
                  <div key={i} className="text-center group">
                     <h3 className="text-5xl font-black text-slate-900 group-hover:text-[#D93644] transition-colors duration-300">
                        {stat.val}
                     </h3>
                     <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mt-2">{stat.label}</p>
                     <p className="text-[10px] text-slate-400">{stat.sub}</p>
                  </div>
               ))}
            </div>
         </section>

         {/* ─── 4. WHAT IS AU PAIR & HISTORY ─── */}
         <section className="py-32 px-6 relative z-10" aria-labelledby="aupair-what-is-title">
            <div className="max-w-7xl mx-auto">
               <div className="grid lg:grid-cols-2 gap-20">
                  {/* Left: Definition */}
                  <m.div
                     initial={{ opacity: 0, x: -50 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.8 }}
                     className="space-y-8"
                  >
                     <h2 id="aupair-what-is-title" className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                        {t("whatIsTitle")} <span className="text-[#D93644]">{t("whatIsTitleHighlight")}</span>
                     </h2>
                     <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                        <p>
                           {t("whatIsP1")} <span className="font-bold text-emerald-600">"{t("whatIsEqual")}"</span> {t("whatIsOr")} <span className="font-bold text-emerald-600">"{t("whatIsEqualRights")}"</span> {t("whatIsMeaning")}
                        </p>
                        <p className="font-medium bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                           {t("whatIsBox")}
                        </p>
                     </div>
                  </m.div>

                  {/* Right: History */}
                  <m.div
                     initial={{ opacity: 0, x: 50 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.8 }}
                     className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-full opacity-50" />
                     <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <FaGlobeEurope className="text-emerald-500" /> {t("historyTitle")}
                     </h3>
                     <div className="space-y-4 text-slate-600">
                        <p>
                           <span className="font-bold text-[#D93644]">{t("historyYear")}</span> {t("historyP1")}
                        </p>
                        <p>
                           {t("historyP2")}
                        </p>
                     </div>
                     <Link href="/register" className="inline-flex items-center gap-2 mt-8 text-[#D93644] font-bold uppercase tracking-widest text-xs hover:gap-4 transition-all">
                        {t("register")} <ArrowRight size={16} />
                     </Link>
                  </m.div>
               </div>
            </div>
         </section>

         {/* ─── 5. BENEFITS (3D CARDS) ─── */}
         <section className="py-24 bg-slate-50/50 relative" aria-labelledby="aupair-benefits-title">
            <div className="max-w-7xl mx-auto px-6">
               <div className="text-center mb-16">
                  <h2 id="aupair-benefits-title" className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{t("benefitsTitle")} <span className="text-emerald-500">{t("benefitsHighlight")}</span></h2>
                  <p className="text-slate-500 max-w-2xl mx-auto">{t("benefitsSub")}</p>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {benefits.map((item, i) => (
                     <TiltCard key={i} {...item} index={i} />
                  ))}
               </div>
            </div>
         </section>

         {/* ─── 6. STEPS (Timeline) ─── */}
         <section className="py-32 px-6 relative overflow-hidden" aria-labelledby="aupair-steps-title">
            <div className="max-w-5xl mx-auto relative z-10">
               <h2 id="aupair-steps-title" className="text-4xl font-black text-center mb-20">{t("stepsTitle")} <span className="text-[#D93644]">{t("stepsHighlight")}</span></h2>

               <div className="space-y-12 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-200 via-rose-200 to-transparent rounded-full -ml-0.5 md:ml-0" />

                  {steps.map((step, i) => (
                     <m.div
                        key={i}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className={`relative flex items-center gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                     >
                        {/* Number Circle */}
                        <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-emerald-50 shadow-lg flex items-center justify-center z-10 text-xl font-black text-slate-300">
                           {step.id}
                        </div>

                        <div className={`w-full md:w-1/2 pl-24 md:pl-0 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                           <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow border border-slate-100 group">
                              <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#D93644] transition-colors">{step.title}</h4>
                              <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                           </div>
                        </div>
                        <div className="hidden md:block w-1/2" />
                     </m.div>
                  ))}
               </div>
            </div>
         </section>

         {/* ─── 7. IAPA & ECAPS (Authority) ─── */}
         <section className="py-24 bg-[#052e16] text-white relative overflow-hidden rounded-t-[3rem] mt-12" aria-labelledby="aupair-iapa-title">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D93644]/20 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
               <div className="grid lg:grid-cols-2 gap-16">
                  {/* IAPA */}
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 mb-4">
                        <FaShieldAlt className="text-4xl text-emerald-400" />
                        <h3 className="text-3xl font-black">{t("iapa_title")}</h3>
                     </div>
                     <p className="text-emerald-100/80 leading-relaxed">
                        {t("iapa_p1")}
                     </p>
                     <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                        <p className="font-bold text-white mb-2">{t("member_title")}</p>
                        <p className="text-sm text-emerald-200">
                           {t("member_since")} <span className="text-[#D93644] font-bold">"{t("member_badge")}"</span>.
                        </p>
                     </div>
                  </div>

                  {/* ECAPS */}
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 mb-4">
                        <FaFileContract className="text-4xl text-[#D93644]" />
                        <h3 className="text-3xl font-black">{t("ecaps_title")}</h3>
                     </div>
                     <p className="text-emerald-100/80 leading-relaxed">
                        {t("ecaps_p1")}
                     </p>
                     <ul className="space-y-3 pt-2">
                        {[t("ecaps_list1"), t("ecaps_list2"), t("ecaps_list3")].map((item, i) => (
                           <li key={i} className="flex items-center gap-3 text-sm font-bold text-white">
                              <CheckCircle2 className="text-[#D93644]" size={18} /> {item}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
         </section>

      </div>
   );
}

// ─── 3D MAGNETIC CARD COMPONENT ───
const TiltCard = ({ icon: Icon, title, desc, index }: { icon: any, title: string, desc: string, index: number }) => {
   const ref = useRef<HTMLDivElement>(null);
   const x = useMotionValue(0);
   const y = useMotionValue(0);

   const xSpring = useSpring(x, { stiffness: 150, damping: 15 });
   const ySpring = useSpring(y, { stiffness: 150, damping: 15 });
   const rotateX = useTransform(ySpring, [-0.5, 0.5], ["12deg", "-12deg"]);
   const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

   const glareX = useTransform(xSpring, [-0.5, 0.5], ["0%", "100%"]);
   const glareY = useTransform(ySpring, [-0.5, 0.5], ["0%", "100%"]);

   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = mouseX / rect.width - 0.5;
      const yPct = mouseY / rect.height - 0.5;
      x.set(xPct);
      y.set(yPct);
   };

   const handleMouseLeave = () => { x.set(0); y.set(0); };

   const isEmerald = index % 2 === 0;

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
         className={`group relative min-h-[220px] p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl cursor-pointer perspective-1000 overflow-hidden
        ${isEmerald ? "hover:border-emerald-200" : "hover:border-red-200"}`}
      >
         <m.div
            style={{ background: useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.8), transparent 50%)` }}
            className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-20 mix-blend-overlay"
         />

         <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6
          ${isEmerald
                  ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"
                  : "bg-red-50 text-[#D93644] group-hover:bg-[#D93644] group-hover:text-white"}`}>
               <Icon size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:translate-x-1 transition-transform">{title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
         </div>
      </m.div>
   );
};