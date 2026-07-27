"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
   Calendar,
   MapPin,
   ArrowLeft,
   Share2,
   Clock,
   Tag,
   Loader2,
   Facebook,
   Twitter,
   Linkedin,
   Zap,
   Bookmark,
   Users,
   Building2,
   CalendarDays,
   CheckCircle2
} from "lucide-react";
import { m, useScroll, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/useAuth";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

interface EventDetail {
   _id: string;
   title: { en: string; mn: string; de: string };
   description: { en: string; mn: string; de: string };
   date: string;
   timeString: string;
   location: { en: string; mn: string; de: string };
   image: string;
   category: string;
   university: string;
   status: string;
   featured: boolean;
   attendees: string[];
}

export default function EventDetailPage() {
   const t = useTranslations("events");
   const locale = useLocale() as "en" | "mn" | "de";
   const params = useParams();
   const router = useRouter();
   const { user, isLoaded: userLoaded } = useAuth();
   const { theme } = useTheme();
   const { scrollYProgress } = useScroll();
   const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

   const [mounted, setMounted] = useState(false);
   const [event, setEvent] = useState<EventDetail | null>(null);
   const [loading, setLoading] = useState(true);
   const [joining, setJoining] = useState(false);
   const [hasJoined, setHasJoined] = useState(false);

   useEffect(() => setMounted(true), []);
   const isDark = mounted && (theme === "dark" || !theme);
   const id = params.id as string;

   useEffect(() => {
      async function fetchEvent() {
         if (!id) return;
         try {
            const res = await fetch(`/api/events/${id}`);
            if (res.ok) {
               const json = await res.json();
               setEvent(json);
            }
         } catch (error) { console.error(error); }
         finally { setLoading(false); }
      }
      fetchEvent();
   }, [id]);

   const handleJoinEvent = async () => {
      if (!user) {
         router.push('/apply');
         return;
      }

      setJoining(true);
      try {
         const res = await fetch(`/api/events/${id}`, {
            method: 'POST',
         });
         const data = await res.json();
         if (res.ok) {
            setHasJoined(true);
            // Refresh event data to update attendee count
            const refreshRes = await fetch(`/api/events/${id}`);
            if (refreshRes.ok) {
               const json = await refreshRes.json();
               setEvent(json);
            }
         } else {
            alert(data.error || "Failed to join event");
         }
      } catch (error) {
         console.error("Error joining event:", error);
         alert("Something went wrong. Please try again.");
      } finally {
         setJoining(false);
      }
   };

   if (!mounted || loading) {
      return (
         <div className={`min-h-[100dvh] flex items-center justify-center ${isDark ? "bg-[#001829]" : "bg-slate-50"}`}>
            <Loader2 className="w-10 h-10 text-[#00aeef] animate-spin" />
         </div>
      );
   }

   if (!event) return (
      <div className={`min-h-[100dvh] flex flex-col items-center justify-center ${isDark ? "bg-[#001829] text-white" : "bg-slate-50 text-slate-900"}`}>
         <h1 className="text-2xl font-black mb-4">{t("notFound")}</h1>
         <Link href="/events" className="text-[#00aeef] font-bold">{t("returnToEvents")}</Link>
      </div>
   );

   const eventDate = new Date(event.date).toLocaleDateString(locale === 'mn' ? 'mn-MN' : locale === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
   });

   return (
      <div className={`min-h-[100dvh] transition-colors duration-700 pt-20 pb-20 font-sans
      ${isDark ? "bg-[#001829] text-white" : "bg-white text-slate-900"}`}>

         {/* SCROLL PROGRESS BAR */}
         <m.div className="fixed top-0 left-0 right-0 h-1.5 bg-[#00aeef] z-[60] origin-left" style={{ scaleX }} />

         {/* BACKGROUND DECOR */}
         <div className="absolute inset-0 pointer-events-none fixed overflow-hidden">
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] transition-opacity duration-700
            ${isDark ? "bg-[#00aeef] opacity-[0.05]" : "bg-sky-100 opacity-[0.4]"}`} />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
         </div>

         <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">

            {/* NAVIGATION */}
            <div className="mb-12">
               <Link href="/events" className={`group inline-flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all
              ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}>
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#00aeef]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t("back")}</span>
               </Link>
            </div>

            {/* HEADER SECTION */}
            <div className="max-w-4xl mb-16">
               <div className="flex flex-wrap items-center gap-4 text-[#00aeef] mb-8">
                  <div className="px-4 py-1.5 rounded-full bg-[#00aeef]/10 border border-[#00aeef]/20 text-[10px] font-black uppercase tracking-[0.2em]">
                     {event.category}
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/60" : "text-slate-50"}`}>
                     <Building2 size={14} className="text-[#00aeef]" />
                     {event.university}
                  </div>
               </div>

               <m.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-12 ${isDark ? "text-white" : "text-[#001829]"}`}>
                  {event.title[locale] || event.title.en}
               </m.h1>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-start gap-4">
                     <div className="p-3 rounded-2xl bg-[#00aeef]/10 text-[#00aeef]">
                        <CalendarDays size={20} />
                     </div>
                     <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-1`}>{t("date")}</p>
                        <p className="text-sm font-bold">{eventDate}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="p-3 rounded-2xl bg-[#00aeef]/10 text-[#00aeef]">
                        <Clock size={20} />
                     </div>
                     <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-1`}>{t("time")}</p>
                        <p className="text-sm font-bold">{event.timeString}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="p-3 rounded-2xl bg-[#00aeef]/10 text-[#00aeef]">
                        <MapPin size={20} />
                     </div>
                     <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-1`}>{t("location")}</p>
                        <p className="text-sm font-bold">{event.location[locale] || event.location.en}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* IMAGE */}
            <m.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative aspect-[21/9] w-full rounded-[4rem] overflow-hidden mb-20 shadow-3xl border border-white/5"
            >
               <Image
                  src={optimizeCloudinaryUrl(event.image)}
                  alt={event.title[locale] || event.title.en}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </m.div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

               {/* DESCRIPTION */}
               <div className="lg:col-span-8">
                  <div className="prose prose-xl prose-slate dark:prose-invert max-w-none">
                     {(event.description[locale] || event.description.en).split('\n').map((para, i) => (
                        para.trim() && (
                           <m.p
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.05 }}
                              className={`text-lg md:text-xl leading-[1.8] font-medium mb-8 transition-colors
                           ${isDark ? "text-white/80" : "text-slate-700"}`}
                           >
                              {para}
                           </m.p>
                        )
                     ))}
                  </div>
               </div>

               {/* SIDEBAR */}
               <aside className="lg:col-span-4">
                  <div className="sticky top-32 space-y-10">

                     {/* Registration Card */}
                     <div className={`p-8 rounded-[3rem] border transition-all
                    ${isDark ? "bg-[#00aeef] text-white shadow-[#00aeef]/20 shadow-2xl" : "bg-[#001829] text-white shadow-2xl"}`}>
                        <Zap size={32} fill="currentColor" className="mb-6" />
                        <h4 className="text-2xl font-black tracking-tight mb-3 leading-tight">
                           {hasJoined ? t("registrationSuccess") : t("readyToJoin")}
                        </h4>
                        <p className="text-xs font-bold opacity-80 mb-8 leading-relaxed">
                           {hasJoined
                              ? t("joinedSuccess")
                              : t("secureSpot")}
                        </p>

                        <button
                           onClick={handleJoinEvent}
                           disabled={joining || hasJoined || event.status !== 'upcoming'}
                           className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2
                          ${hasJoined
                                 ? "bg-emerald-500 text-white cursor-default"
                                 : (isDark ? "bg-white text-[#00aeef]" : "bg-[#00aeef] text-white")}
                          ${joining ? "opacity-70 cursor-wait" : ""}
                       `}
                        >
                           {joining ? (
                              <Loader2 size={16} className="animate-spin" />
                           ) : hasJoined ? (
                              <CheckCircle2 size={16} />
                           ) : null}
                           {hasJoined ? t("joined") : t("join")}
                        </button>

                        <div className="mt-6 flex items-center justify-between opacity-80">
                           <div className="flex items-center gap-2">
                              <Users size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{event.attendees?.length || 0} {t("attendees")}</span>
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">● {event.status}</span>
                        </div>
                     </div>

                     {/* Share */}
                     <div className={`p-8 rounded-[3rem] border transition-all
                    ${isDark ? "bg-[#001d30] border-white/5 shadow-2xl" : "bg-slate-50 border-slate-200 shadow-sm"}`}>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-[#00aeef]">{t("share")}</h4>
                        <div className="grid grid-cols-3 gap-4">
                           {[
                              { icon: Facebook, color: "#1877F2" },
                              { icon: Twitter, color: "#1DA1F2" },
                              { icon: Linkedin, color: "#0A66C2" }
                           ].map((soc, i) => (
                              <button
                                 key={i}
                                 className={`aspect-square rounded-3xl border flex items-center justify-center transition-all group
                               ${isDark ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-white border-white hover:shadow-md"}`}>
                                 <soc.icon size={20} style={{ color: soc.color }} className="transition-transform group-hover:scale-110" />
                              </button>
                           ))}
                        </div>
                     </div>

                  </div>
               </aside>

            </div>
         </div>
      </div>
   );
}