"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
   Briefcase,
   GraduationCap,
   Heart,
   MapPin,
   Clock,
   ExternalLink,
   ArrowLeft,
   Share2,
   CheckCircle2,
   Loader2
} from "lucide-react";
import { m } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";

// --- TYPES ---
interface Opportunity {
   id: string;
   type: 'scholarship' | 'internship' | 'volunteer';
   title: { en: string; mn: string; de: string };
   provider: { en: string; mn: string; de: string };
   location: { en: string; mn: string; de: string };
   deadline: string;
   postedDate?: string;
   description: { en: string; mn: string; de: string };
   requirements?: { en: string[]; mn: string[]; de: string[] };
   tags: string[];
   link: string;
   image?: string;
}

export default function OpportunityDetail() {
   const t = useTranslations("opportunities");
   const locale = useLocale() as "en" | "mn" | "de";
   const params = useParams();
   const { theme } = useTheme();

   const [mounted, setMounted] = useState(false);
   const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
   const [loading, setLoading] = useState(true);

   // Sync with theme and hydration
   useEffect(() => setMounted(true), []);
   const isDark = mounted && (theme === "dark" || !theme);
   const id = params.id as string;

   useEffect(() => {
      async function fetchOpportunity() {
         if (!id) return;
         try {
            const res = await fetch(`/api/opportunities/${id}`);
            if (res.ok) {
               const json = await res.json();
               setOpportunity(json);
            }
         } catch (error) {
            console.error("Failed to load opportunity", error);
         } finally {
            setLoading(false);
         }
      }
      fetchOpportunity();
   }, [id]);

   if (!mounted || loading) {
      return (
         <div className={`min-h-[100dvh] flex items-center justify-center transition-colors duration-700
        ${isDark ? "bg-[#001829]" : "bg-slate-50"}`}>
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="w-8 h-8 text-[#00aeef] animate-spin" />
               <p className={`text-sm tracking-widest uppercase font-bold ${isDark ? "text-white/40" : "text-slate-400"}`}>
                  {t("loading")}
               </p>
            </div>
         </div>
      );
   }

   if (!opportunity) {
      return (
         <div className={`min-h-[100dvh] flex items-center justify-center transition-colors duration-700
        ${isDark ? "bg-[#001829]" : "bg-slate-50"}`}>
            <div className="text-center">
               <h2 className={`text-2xl font-black mb-4 ${isDark ? "text-white" : "text-[#001829]"}`}>{t("notFound")}</h2>
               <Link href="/opportunities" className="text-[#00aeef] hover:underline font-bold">{t("back")}</Link>
            </div>
         </div>
      );
   }

   const Icon = opportunity.type === 'scholarship' ? GraduationCap : opportunity.type === 'internship' ? Briefcase : Heart;
   const typeColor = opportunity.type === 'scholarship' ? "text-purple-500" : opportunity.type === 'internship' ? "text-blue-500" : "text-rose-500";
   const typeBg = opportunity.type === 'scholarship' ? "bg-purple-500/10" : opportunity.type === 'internship' ? "bg-blue-500/10" : "bg-rose-500/10";

   return (
      <div className={`min-h-[100dvh] transition-colors duration-700 pt-28 pb-20 px-6 font-sans
      ${isDark ? "bg-[#001829] text-white" : "bg-slate-50 text-slate-900"}`}>

         {/* Background Decor */}
         <div className="absolute inset-0 pointer-events-none fixed">
            <div className={`absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[250px] transition-opacity duration-700
            ${isDark ? "bg-[#00aeef] opacity-[0.05]" : "bg-sky-200 opacity-[0.4]"}`} />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
         </div>

         <div className="relative z-10 max-w-5xl mx-auto">

            <Link href="/opportunities" className={`inline-flex items-center gap-2 mb-8 opacity-60 hover:opacity-100 transition-opacity font-bold text-xs uppercase tracking-widest ${isDark ? "text-white" : "text-slate-900"}`}>
               <ArrowLeft size={14} /> {t("back")}
            </Link>

            {/* HERO HEADER */}
            <m.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className={`rounded-[3rem] overflow-hidden border p-8 md:p-12 mb-8 relative
            ${isDark ? "bg-[#001d30]/60 border-white/5" : "bg-white border-slate-200 shadow-xl shadow-slate-200/40"}`}
            >
               {/* TYPE BADGE */}
               <div className="flex justify-between items-start mb-8">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${typeBg} ${typeColor} font-black text-[10px] uppercase tracking-[0.2em]`}>
                     <Icon size={14} />
                     {opportunity.type}
                  </div>
                  <div className="flex gap-2">
                     <button className={`p-3 rounded-full transition-colors ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"}`}>
                        <Share2 size={18} className={isDark ? "text-white" : "text-slate-600"} />
                     </button>
                  </div>
               </div>

               <h1 className={`text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-6 ${isDark ? "text-white" : "text-[#001829]"}`}>
                  {opportunity.title[locale] || opportunity.title.en}
               </h1>

               <div className="flex flex-wrap items-center gap-6 md:gap-12 text-sm font-bold opacity-80">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
                        <Briefcase size={14} />
                     </div>
                     <span>{opportunity.provider[locale] || opportunity.provider.en}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
                        <MapPin size={14} />
                     </div>
                     <span>{opportunity.location[locale] || opportunity.location.en}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
                        <Clock size={14} className="text-[#00aeef]" />
                     </div>
                     <span className="text-[#00aeef]">{t("deadline")}: {opportunity.deadline}</span>
                  </div>
               </div>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* LEFT CONTENT */}
               <div className="md:col-span-2 space-y-8">
                  {/* DESCRIPTION */}
                  <m.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     className={`rounded-[2.5rem] border p-8 md:p-10
                  ${isDark ? "bg-[#001d30]/40 border-white/5" : "bg-white border-slate-200"}`}
                  >
                     <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 rounded-full bg-[#00aeef]" />
                        {t("about")}
                     </h3>
                     <p className={`leading-loose opacity-80 ${isDark ? "text-white/80" : "text-slate-700"}`}>
                        {opportunity.description[locale] || opportunity.description.en}
                     </p>
                  </m.div>

                  {/* REQUIREMENTS */}
                  {(opportunity.requirements?.[locale] || opportunity.requirements?.en) && (
                     <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`rounded-[2.5rem] border p-8 md:p-10
                    ${isDark ? "bg-[#001d30]/40 border-white/5" : "bg-white border-slate-200"}`}
                     >
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                           <span className="w-1.5 h-6 rounded-full bg-[#fbbf24]" />
                           {t("requirements")}
                        </h3>
                        <ul className="space-y-4">
                           {(opportunity.requirements[locale] || opportunity.requirements.en).map((req, i) => (
                              <li key={i} className="flex items-start gap-4">
                                 <CheckCircle2 size={20} className="text-[#fbbf24] shrink-0 mt-0.5" />
                                 <span className={`font-medium ${isDark ? "text-white/80" : "text-slate-700"}`}>{req}</span>
                              </li>
                           ))}
                        </ul>
                     </m.div>
                  )}
               </div>

               {/* RIGHT SIDEBAR */}
               <div className="md:col-span-1 space-y-6">
                  <m.div
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.3 }}
                     className={`sticky top-32 rounded-[2.5rem] border p-8
                  ${isDark ? "bg-[#00aeef]/10 border-[#00aeef]/20" : "bg-sky-50 border-sky-100"}`}
                  >
                     <h3 className="font-black text-lg mb-2">{t("applyNow")}</h3>
                     <p className="text-xs opacity-60 mb-8 font-bold leading-relaxed">
                        {t("applyDesc", { deadline: opportunity.deadline })}
                     </p>

                     <a
                        href={opportunity.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#00aeef] hover:bg-[#009bd5] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-[#00aeef]/30 transition-all active:scale-95"
                     >
                        {t("applyNow")}
                        <ExternalLink size={14} />
                     </a>

                     <div className="mt-8 pt-8 border-t border-dashed border-current/10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 text-center">
                           {t("posted")}: {opportunity.postedDate || "Recently"}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                           {opportunity.tags.map(tag => (
                              <span key={tag} className={`text-[9px] font-bold px-2 py-1 rounded-md opacity-60 ${isDark ? "bg-black/20" : "bg-white"}`}>
                                 #{tag}
                              </span>
                           ))}
                        </div>
                     </div>
                  </m.div>
               </div>
            </div>

         </div>
      </div>
   );
}

