"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
   motion,
   AnimatePresence
} from "framer-motion";
import {
   FaVideo,
   FaArrowRight,
   FaBullhorn,
   FaUserFriends
} from "react-icons/fa";
import { Clock, MapPin, Filter, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

// --- TYPES ---
interface EventItem {
   _id: string;
   title: { [key: string]: string };
   description: { [key: string]: string };
   date: string;
   timeString: string;
   location: { [key: string]: string };
   image: string;
   category: string;
   status: string;
   link?: string;
}

export default function EventsPageRedGreen() {
   const t = useTranslations("EventsPage");
   const locale = useLocale();

   const [activeFilter, setActiveFilter] = useState("all");
   const containerRef = useRef(null);

   const [events, setEvents] = useState<EventItem[]>([]);
   const [loading, setLoading] = useState(true);

   // Categories for filtering
   const CATEGORIES = ["all", "campaign", "workshop", "meeting", "fundraiser"];

   useEffect(() => {
      const fetchEvents = async () => {
         try {
            const res = await fetch("/api/events");
            if (res.ok) {
               const data = await res.json();
               setEvents(data);
            }
         } catch (error) {
            console.error("Failed to fetch events", error);
         } finally {
            setLoading(false);
         }
      };
      fetchEvents();
   }, []);

   const getTagColor = (category: string) => {
      switch (category) {
         case "campaign": return "bg-red-100 text-red-600";
         case "meeting": return "bg-emerald-100 text-emerald-600";
         case "workshop": return "bg-slate-100 text-slate-500";
         default: return "bg-red-50 text-red-500";
      }
   };

   const filteredEvents = activeFilter === "all"
      ? events
      : events.filter(e => e.category === activeFilter);

   if (loading) {
      return (
         <div className="min-h-[100dvh] flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-red-600" size={48} />
         </div>
      );
   }

   return (
      <div ref={containerRef} className="min-h-[100dvh] bg-white text-slate-800 font-sans selection:bg-red-500 selection:text-white">

         {/* ─── 1. HERO SECTION ─── */}
         <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            {/* Animated Background Shapes */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
               <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-50 rounded-full blur-[100px] opacity-60" />
               <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] opacity-60" />
            </div>

            <div className="max-w-7xl mx-auto text-center relative z-10">
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
               >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 text-red-600 shadow-sm mb-6">
                     <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                     <span className="text-xs font-bold uppercase tracking-widest">{t("upcoming")}</span>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-slate-900">
                     {t("heroTitle")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-emerald-600">{t("heroTitleHighlight")}</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                     {t("heroDesc")}
                  </p>
               </motion.div>
            </div>
         </section>

         {/* ─── 2. FILTER & EVENTS GRID ─── */}
         <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">

               {/* Filters */}
               <div className="flex flex-wrap justify-center gap-4 mb-16">
                  {CATEGORIES.map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 border-2 ${activeFilter === cat
                           ? "bg-red-600 border-red-600 text-white shadow-red-200 shadow-lg scale-105"
                           : "bg-white border-slate-100 text-slate-500 hover:border-red-200 hover:text-red-600"
                           }`}
                     >
                        {activeFilter === cat && <Filter size={14} className="fill-white" />}
                        {t(`categories.${cat}`)}
                     </button>
                  ))}
               </div>

               {/* Grid */}
               <motion.div
                  layout
                  className="grid md:grid-cols-2 lg:grid-cols-2 gap-8"
               >
                  <AnimatePresence mode="popLayout">
                     {filteredEvents.map((event) => {
                        const dateObj = new Date(typeof event.date === "string" ? event.date.replace(/-/g, "/") : event.date);
                        const isDateValid = !isNaN(dateObj.getTime());
                        const month = isDateValid ? dateObj.toLocaleDateString(locale, { month: "short" }).toUpperCase() : "TBD";
                        const day = isDateValid ? dateObj.getDate() : "-";
                        const categoryLabel = t(`categories.${event.category}`);
                        const locationText = event.location[locale] || event.location["en"];
                        const titleText = event.title[locale] || event.title["en"];

                        const isOnline = locationText.toLowerCase().includes("online");
                        const isFull = event.status === "past" || event.status === "cancelled";

                        return (
                           <motion.div
                              key={event._id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-xl transition-all group"
                           >
                              <div className="flex flex-col md:flex-row h-full gap-6">

                                 {/* Date & Image */}
                                 <div className="w-full md:w-48 h-48 md:h-auto relative shrink-0">
                                    <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur rounded-2xl px-4 py-2 text-center shadow-lg border border-slate-50">
                                       <span className="block text-xs font-black text-emerald-600 uppercase">{month}</span>
                                       <span className="block text-2xl font-black text-slate-900">{day}</span>
                                    </div>
                                    <Image
                                       src={event.image}
                                       alt={titleText}
                                       fill
                                       className="object-cover rounded-[2rem] group-hover:scale-105 transition-transform duration-500"
                                    />
                                 </div>

                                 {/* Content */}
                                 <div className="flex-1 py-4 pr-4 flex flex-col justify-between">
                                    <div>
                                       <div className="flex items-center gap-3 mb-3">
                                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getTagColor(event.category)}`}>
                                             {categoryLabel}
                                          </span>
                                          {isOnline ? (
                                             <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                                                <FaVideo /> {t("online")}
                                             </span>
                                          ) : (
                                             <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                                                <FaUserFriends /> {t("inPerson")}
                                             </span>
                                          )}
                                       </div>
                                       <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-red-600 transition-colors">
                                          {titleText}
                                       </h3>
                                       <div className="space-y-2">
                                          <p className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                             <Clock size={16} className="text-emerald-500" /> {event.timeString}
                                          </p>
                                          <p className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                             <MapPin size={16} className="text-emerald-500" /> {locationText}
                                          </p>
                                       </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                       <span className={`text-xs font-bold ${isFull ? "text-red-500" : "text-emerald-600"}`}>
                                          {isFull ? t("regClosed") : t("regOpen")}
                                       </span>
                                       <a
                                          href={event.link || "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${isFull
                                             ? "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                                             : "bg-slate-900 text-white hover:bg-red-600 hover:gap-3"
                                             }`}
                                       >
                                          {isFull ? t("full") : t("register")} {!isFull && <FaArrowRight />}
                                       </a>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        );
                     })}
                  </AnimatePresence>
               </motion.div>
            </div>
         </section>

         {/* ─── 3. NEWSLETTER SECTION ─── */}
         <section className="py-24 px-6 bg-slate-50 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center relative z-10">
               <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-red-50 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-50 rounded-tr-full" />

                  <div className="relative z-10">
                     <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                        <FaBullhorn />
                     </div>
                     <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900">
                        {t("newsletterTitle")} <span className="text-emerald-600">{t("newsletterTitleHighlight")}</span>
                     </h2>
                     <p className="text-slate-500 mb-10 max-w-lg mx-auto font-medium">
                        {t("newsletterDesc")}
                     </p>

                     <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                           type="email"
                           placeholder={t("emailPlaceholder")}
                           className="flex-1 px-6 py-4 rounded-2xl text-slate-900 font-bold bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-red-100"
                        />
                        <button className="px-8 py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl">
                           {t("joinBtn")}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </section>

      </div>
   );
}