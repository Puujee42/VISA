"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
   m,
   useScroll,
   useSpring,
   Variants
} from "framer-motion";
import {
   FaGlobeEurope,
   FaGraduationCap,
   FaBaby,
   FaBroom,
   FaMoneyBillWave,
   FaClock,
   FaPlaneDeparture,
   FaGem,
   FaLandmark,
   FaUtensils,
   FaPalette,
   FaHandshake
} from "react-icons/fa";
import { Clock } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

// --- ANIMATIONS ---
const fadeInUp: Variants = {
   hidden: { opacity: 0, y: 30, scale: 0.95 },
   visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", bounce: 0.4, duration: 0.8 }
   }
};

export default function BelgiumClient() {
   const t = useTranslations("BelgiumPage");
   const containerRef = useRef<HTMLDivElement>(null);
   const { scrollYProgress } = useScroll({ target: containerRef });
   const { isSignedIn } = useUser();

   const scaleX = useSpring(scrollYProgress, {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001
   });

   const stats = [
      { label: t("info.stats.capital.label"), val: t("info.stats.capital.val"), icon: FaLandmark, color: "text-blue-600 bg-blue-100" },
      { label: t("info.stats.hours.label"), val: t("info.stats.hours.val"), icon: FaClock, color: "text-yellow-600 bg-yellow-100" },
      { label: t("info.stats.language.label"), val: t("info.stats.language.val"), icon: FaGlobeEurope, color: "text-red-600 bg-red-100" },
   ];

   const culture = [
      { icon: FaGlobeEurope, bg: "bg-blue-500" },
      { icon: FaUtensils, bg: "bg-yellow-500" },
      { icon: FaGem, bg: "bg-teal-500" },
      { icon: FaPalette, bg: "bg-pink-500" },
   ];

   const benefits = [
      { icon: Clock, color: "text-yellow-600" },
      { icon: FaMoneyBillWave, color: "text-green-600" },
      { icon: FaGraduationCap, color: "text-blue-600" },
   ];

   return (
      <div ref={containerRef} className="min-h-[100dvh] bg-[#FAFAFA] text-slate-800 font-sans overflow-hidden selection:bg-rose-400 selection:text-white">

         <m.div
            className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-rose-500 origin-left z-50"
            style={{ scaleX }}
         />

         <section className="relative pt-32 pb-24 px-6 min-h-[90vh] flex items-center justify-center overflow-hidden" aria-labelledby="belgium-hero-title">
            <div className="absolute inset-0 w-full h-full">
               <m.div animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
               <m.div animate={{ x: [0, -80, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
            </div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
               <m.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-8 text-center lg:text-left">
                  <m.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-lg text-slate-600">
                     <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                     </span>
                     <span className="text-xs font-black uppercase tracking-widest">{t("hero.tag")}</span>
                  </m.div>

                  <h1 id="belgium-hero-title" className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]">
                     <span className="block text-slate-800">{t("hero.title")}</span>
                     <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-rose-500">
                        {t("hero.highlight")}
                     </span>
                  </h1>

                  <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">{t("hero.sub")}</p>

                  {!isSignedIn && (
                     <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <Link href="/register">
                           <m.button whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(244, 63, 94, 0.4)" }} whileTap={{ scale: 0.95 }} className="px-12 py-5 rounded-[2rem] bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-lg shadow-xl flex items-center gap-3 relative overflow-hidden group">
                              <span className="relative z-10">{t("hero.cta")}</span>
                              <FaPlaneDeparture className="relative z-10 group-hover:translate-x-1 transition-transform" />
                           </m.button>
                        </Link>
                     </div>
                  )}
               </m.div>

               <div className="relative h-[600px] hidden lg:block">
                  <m.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute right-0 top-0 w-[450px] h-[550px]">
                     <div className="w-full h-full bg-white p-4 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm transform rotate-3">
                        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                           <Image src="https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80" alt="Grand Place in Brussels, Belgium — historic square and iconic destination for au pairs living in Belgium" fill className="object-cover" />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-800/40 to-transparent" />
                           <div className="absolute bottom-8 left-8 text-white">
                              <div className="flex items-center gap-2 mb-2">
                                 <div className="bg-yellow-400 p-2 rounded-full text-slate-800"><FaHandshake size={14} /></div>
                                 <span className="font-bold text-xs uppercase tracking-widest">Family & Friends</span>
                              </div>
                              <h2 className="text-3xl font-black text-white">Connection</h2>
                           </div>
                        </div>
                     </div>
                  </m.div>
               </div>
            </div>
         </section>

         <section className="py-12 bg-white relative z-20">
            <div className="max-w-7xl mx-auto px-6">
               <m.div initial="hidden" whileInView="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid md:grid-cols-3 gap-6">
                  {stats.map((stat, i) => (
                     <m.div key={i} variants={fadeInUp} whileHover={{ y: -5, scale: 1.02 }} className={`p-6 rounded-[2rem] flex items-center gap-4 border-2 border-transparent hover:border-slate-100 shadow-lg bg-white relative overflow-hidden group`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${stat.color}`}><stat.icon /></div>
                        <div><p className="text-xs font-bold uppercase text-slate-400 tracking-wider">{stat.label}</p><p className="text-2xl font-black text-slate-800">{stat.val}</p></div>
                     </m.div>
                  ))}
               </m.div>
            </div>
         </section>

         <section className="py-24 px-6 relative" aria-labelledby="belgium-info-title">
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-16">
                  <m.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} className="inline-block p-3 rounded-full bg-indigo-50 mb-4"><FaGlobeEurope className="text-indigo-600 text-3xl" /></m.div>
                  <h2 id="belgium-info-title" className="text-4xl md:text-5xl font-black text-slate-800 mb-6">{t("info.title")}</h2>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t("info.desc")}</p>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {culture.map((item, i) => (
                     <m.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }} className={`aspect-square rounded-[2.5rem] ${item.bg} flex flex-col items-center justify-center text-white p-6 shadow-xl relative overflow-hidden group cursor-pointer`}>
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-4"><item.icon size={32} /></div>
                        <h3 className="font-black text-center leading-tight">{t(`culture.${i}.name`)}</h3>
                        <p className="text-xs opacity-80 mt-2 font-bold uppercase tracking-widest">{t(`culture.${i}.desc`)}</p>
                     </m.div>
                  ))}
               </div>
            </div>
         </section>

         <section className="py-24 bg-slate-50 relative" aria-labelledby="belgium-benefits-title">
            <div className="max-w-7xl mx-auto px-6 text-center mb-16">
               <h2 id="belgium-benefits-title" className="text-4xl md:text-5xl font-black text-slate-800 mb-12">Program Benefits</h2>
               <div className="grid md:grid-cols-3 gap-8">
                  {benefits.map((item, i) => (
                     <m.div key={i} whileHover={{ y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 ${item.color}`}><item.icon /></div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">{t(`benefits.${i}.title`)}</h3>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{t(`benefits.${i}.sub`)}</p>
                     </m.div>
                  ))}
               </div>
            </div>
         </section>

         {!isSignedIn && (
            <section className="py-24 px-6 bg-white">
               <div className="max-w-4xl mx-auto text-center">
                  <Link href="/register">
                     <m.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-16 py-6 rounded-full bg-yellow-400 text-slate-800 font-black text-xl uppercase tracking-widest shadow-[0_10px_40px_rgba(250,204,21,0.4)]">
                        {t("hero.cta")}
                     </m.button>
                  </Link>
               </div>
            </section>
         )}

      </div>
   );
}