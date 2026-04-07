"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import {
   Play,
   Clock,
   BarChart,
   BookOpen,
   ArrowRight,
   Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

// --- TYPES ---
interface Lesson {
   _id: string;
   title: { [key: string]: string };
   description: { [key: string]: string };
   image: string;
   videoLink: string;
   difficulty: "beginner" | "intermediate" | "advanced";
   category: string;
   duration: string;
   studentsJoined: number;
}

export default function LessonsClient() {
   const t = useTranslations("LessonsPage");
   const locale = useLocale();

   const [lessons, setLessons] = useState<Lesson[]>([]);
   const [loading, setLoading] = useState(true);

   // FETCH LESSONS
   useEffect(() => {
      fetch('/api/lessons')
         .then(res => res.json())
         .then(data => {
            if (Array.isArray(data)) setLessons(data);
         })
         .catch(err => console.error(err))
         .finally(() => setLoading(false));
   }, []);

   const getDifficultyColor = (level: string) => {
      switch (level) {
         case 'beginner': return "bg-emerald-100 text-emerald-600";
         case 'intermediate': return "bg-blue-100 text-blue-600";
         case 'advanced': return "bg-red-100 text-red-600";
         default: return "bg-slate-100 text-slate-600";
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-red-600" size={48} />
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#F8F9FC] text-slate-800 font-sans selection:bg-red-500 selection:text-white pb-20">

         {/* ─── 1. HERO SECTION ─── */}
         <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            {/* Animated Orbs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 text-center">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-50 text-red-600 shadow-sm mb-6"
               >
                  <BookOpen size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">{t("badge")}</span>
               </motion.div>
               <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter"
               >
                  {t("heroTitle")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-emerald-600">{t("heroTitleHighlight")}</span>
               </motion.h1>
               <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium"
               >
                  {t("heroDesc")}
               </motion.p>
            </div>
         </section>

         {/* ─── 2. LESSONS GRID ─── */}
         <section className="px-6 py-10">
            <div className="max-w-7xl mx-auto">
               {lessons.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {lessons.map((lesson, idx) => {
                        const titleText = lesson.title[locale] || lesson.title["en"];
                        const descText = lesson.description[locale] || lesson.description["en"];
                        return (
                           <motion.div
                              key={lesson._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:border-red-100 hover:shadow-2xl transition-all flex flex-col"
                           >
                              {/* Thumbnail */}
                              <div className="relative aspect-video overflow-hidden">
                                 {lesson.image ? (
                                    <Image
                                       src={lesson.image}
                                       alt={titleText}
                                       fill
                                       className="object-cover group-hover:scale-110 transition-transform duration-700"
                                       unoptimized
                                    />
                                 ) : (
                                    <div className="absolute inset-0 bg-slate-200 group-hover:scale-110 transition-transform duration-700" />
                                 )}
                                 <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-600 shadow-xl scale-0 group-hover:scale-100 transition-transform duration-500">
                                       <Play fill="currentColor" size={28} />
                                    </div>
                                 </div>
                                 <span className="absolute top-6 left-6 px-4 py-1 rounded-full bg-white/90 backdrop-blur text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    {t(`category.${lesson.category}`)}
                                 </span>
                              </div>

                              {/* Content */}
                              <div className="p-8 flex-1 flex flex-col">
                                 <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getDifficultyColor(lesson.difficulty)}`}>
                                       {t(`difficulty.${lesson.difficulty}`)}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                                       <Clock size={14} /> {lesson.duration}
                                    </span>
                                 </div>
                                 <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 group-hover:text-red-600 transition-colors leading-tight">
                                    {titleText}
                                 </h3>
                                 <p className="text-slate-500 font-medium text-sm mb-6 line-clamp-2">
                                    {descText}
                                 </p>

                                 <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <div className="flex -space-x-2">
                                          {[1, 2, 3].map(i => (
                                             <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                                          ))}
                                       </div>
                                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                          {lesson.studentsJoined} {t("joined")}
                                       </span>
                                    </div>
                                    <Link href={lesson.videoLink} target="_blank" className="flex items-center gap-2 text-red-600 font-black uppercase tracking-widest text-xs hover:gap-3 transition-all">
                                       {t("joinClass")} <ArrowRight size={14} />
                                    </Link>
                                 </div>
                              </div>
                           </motion.div>
                        );
                     })}
                  </div>
               ) : (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                     <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                     <p className="text-slate-400 font-bold">{t("noLessons")}</p>
                  </div>
               )}
            </div>
         </section>

      </div>
   );
}