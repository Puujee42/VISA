"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
   m,
   useScroll,
   useTransform,
   Variants
} from "framer-motion";
import {
   FaGlobeEurope,
   FaGraduationCap,
   FaMoneyBillWave,
   FaHome,
   FaClock,
   FaPlaneDeparture,
   FaMountain,
   FaSkiing,
   FaLandmark,
   FaCookieBite,
   FaLeaf
} from "react-icons/fa";
import { Watch, ShieldCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

// --- ANIMATION VARIANTS ---
const containerVar: Variants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVar: Variants = {
   hidden: { opacity: 0, y: 20 },
   visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.5 } }
};

export default function SwitzerlandClient() {
   const t = useTranslations("SwitzerlandPage");
   const containerRef = useRef(null);
   const { scrollYProgress } = useScroll({ target: containerRef });
   const yHero = useTransform(scrollYProgress, [0, 1], [0, -200]);
   const { isSignedIn } = useUser();

   const stats = [
      { label: t("info.stats.capital.label"), val: t("info.stats.capital.val") },
      { label: t("info.stats.city.label"), val: t("info.stats.city.val") },
      { label: t("info.stats.languages.label"), val: t("info.stats.languages.val") },
   ];

   const brands = [
      { icon: FaCookieBite, name: "Nestlé Chocolate", color: "text-red-600 bg-red-50" },
      { icon: Watch, name: "Rolex Quality", color: "text-emerald-600 bg-emerald-50" },
      { icon: FaLandmark, name: "Swiss Banking", color: "text-emerald-600 bg-emerald-50" },
      { icon: FaLeaf, name: "Clean Nature", color: "text-red-600 bg-red-50" },
   ];

   const highlights = [
      { icon: FaMoneyBillWave, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
      { icon: FaGraduationCap, color: "text-red-600 bg-red-50 border-red-100" },
      { icon: FaPlaneDeparture, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
   ];

   const contract = [
      { icon: FaClock, title: t("contract.items.hours.title"), desc: t("contract.items.hours.desc") },
      { icon: FaMoneyBillWave, title: t("contract.items.money.title"), desc: t("contract.items.money.desc") },
      { icon: FaGraduationCap, title: t("contract.items.course.title"), desc: t("contract.items.course.desc") },
      { icon: FaSkiing, title: t("contract.items.vacation.title"), desc: t("contract.items.vacation.desc") },
   ];

   return (
      <div ref={containerRef} className="min-h-[100dvh] bg-white text-slate-800 font-sans selection:bg-red-500 selection:text-white overflow-hidden">

         <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-b from-red-100 to-transparent rounded-full blur-[100px] opacity-80" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-t from-emerald-100 to-transparent rounded-full blur-[100px] opacity-80" />

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
               <m.div initial="hidden" animate="visible" variants={containerVar} className="space-y-8 text-center lg:text-left">
                  <m.div variants={itemVar} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 text-white shadow-lg shadow-red-200">
                     <FaMountain />
                     <span className="text-xs font-bold uppercase tracking-widest">{t("hero.tag")}</span>
                  </m.div>

                  <m.h1 variants={itemVar} className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-slate-900">
                     <span className="block text-slate-800">{t("hero.title")}</span>
                     <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-emerald-500">
                        {t("hero.highlight")}
                     </span>
                  </m.h1>

                  <m.p variants={itemVar} className="text-xl text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">{t("hero.sub")}</m.p>

                  <m.div variants={itemVar} className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                     {!isSignedIn && (
                        <Link href="/register">
                           <button className="px-10 py-4 rounded-xl bg-red-600 text-white font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-600 hover:scale-105 transition-all flex items-center gap-3">
                              {t("hero.cta")} <FaPlaneDeparture />
                           </button>
                        </Link>
                     )}
                     <Link href="/about">
                        <button className="px-10 py-4 rounded-xl bg-white text-emerald-600 border-2 border-emerald-100 font-bold text-sm uppercase tracking-widest hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                           {t("hero.about")}
                        </button>
                     </Link>
                  </m.div>
               </m.div>

               <div className="relative h-[600px] hidden lg:block perspective-1000">
                  <m.div style={{ y: yHero, rotateY: -10, rotateX: 5 }} className="absolute right-8 top-8 w-[420px] h-[550px] bg-white p-4 rounded-[2rem] shadow-2xl border border-red-100 z-20">
                     <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                        <Image src="https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80" alt="Swiss Alps" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 text-white">
                           <div className="flex items-center gap-2 mb-2 text-emerald-300">
                              <FaSkiing />
                              <p className="font-bold text-xs uppercase tracking-widest">Alps Life</p>
                           </div>
                           <h3 className="text-3xl font-black">Switzerland</h3>
                        </div>
                     </div>
                  </m.div>
               </div>
            </div>
         </section>

         <section className="py-24 px-6 bg-white relative">
            <div className="max-w-7xl mx-auto">
               <div className="grid lg:grid-cols-2 gap-20 items-center mb-20">
                  <m.div initial="hidden" whileInView="visible" variants={containerVar} viewport={{ once: true }}>
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white text-xl shadow-lg shadow-red-200"><FaGlobeEurope /></div>
                        <h2 className="text-4xl font-black text-slate-900">{t("info.title")}</h2>
                     </div>
                     <p className="text-lg text-slate-600 leading-relaxed font-medium border-l-4 border-red-500 pl-6 mb-8 bg-red-50 py-4 rounded-r-xl">{t("info.desc")}</p>
                     <div className="grid grid-cols-3 gap-4">
                        {stats.map((s, i) => (
                           <div key={i} className="text-center p-4 bg-white rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-400 transition-colors">
                              <span className="block text-[10px] font-bold uppercase text-emerald-600 mb-1">{s.label}</span>
                              <span className="block text-xl font-black text-slate-800">{s.val}</span>
                           </div>
                        ))}
                     </div>
                  </m.div>
                  <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-red-50 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-bl-[10rem] -z-0" />
                     <h3 className="text-2xl font-black text-slate-900 mb-8 relative z-10">{t("info.quality")}</h3>
                     <div className="grid grid-cols-2 gap-6 relative z-10">
                        {brands.map((brand, i) => (
                           <m.div key={i} whileHover={{ y: -5 }} className={`flex flex-col items-center justify-center p-6 rounded-3xl text-center border transition-colors duration-300 ${brand.color} border-transparent hover:border-current`}>
                              <brand.icon className="text-3xl mb-3" />
                              <span className="font-bold text-sm text-slate-700">{brand.name}</span>
                           </m.div>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="grid md:grid-cols-3 gap-6">
                  {highlights.map((h, i) => (
                     <m.div key={i} whileHover={{ y: -10 }} className={`p-8 rounded-3xl shadow-sm border-2 flex items-center gap-5 group hover:shadow-xl transition-all ${h.color}`}>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm"><h.icon /></div>
                        <div><h4 className="text-3xl font-black">{t(`highlights.${i}.title`)}</h4><p className="text-xs font-bold uppercase opacity-80">{t(`highlights.${i}.sub`)}</p></div>
                     </m.div>
                  ))}
               </div>
            </div>
         </section>

         <section className="py-24 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
               <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-black mb-6">{t("contract.title_pre")} <span className="text-emerald-100">{t("contract.title_post")}</span></h2>
                  <p className="text-white/80 font-medium">{t("contract.desc")}</p>
               </div>
               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                  {contract.map((item, i) => (
                     <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 hover:bg-white hover:text-emerald-700 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-white text-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-lg mb-6 group-hover:scale-110 transition-transform"><item.icon /></div>
                        <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                        <p className="text-sm opacity-80 font-medium leading-relaxed group-hover:opacity-100">{item.desc}</p>
                     </div>
                  ))}
               </div>
               <div className="bg-white text-slate-900 p-10 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row gap-12 items-center justify-between shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-8 relative z-10">
                     <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-white"><FaHome /></div>
                     <div><h3 className="text-2xl font-black text-slate-900 mb-1">{t("housing.title")}</h3><p className="text-red-600 font-bold tracking-widest uppercase text-xs">{t("housing.sub")}</p></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 w-full md:w-auto relative z-10">
                     {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-red-50 px-4 py-2 rounded-lg"><ShieldCheck className="text-red-500 w-5 h-5" /> {t(`housing.items.${i}`)}</div>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {!isSignedIn && (
            <section className="py-24 px-6 bg-white">
               <div className="max-w-4xl mx-auto text-center">
                  <Link href="/register">
                     <button className="px-16 py-5 rounded-xl bg-red-600 text-white font-black text-lg uppercase tracking-widest shadow-lg shadow-red-200 hover:shadow-xl hover:bg-red-700 hover:-translate-y-1 transition-all">
                        {t("hero.cta")}
                     </button>
                  </Link>
               </div>
            </section>
         )}

      </div>
   );
}