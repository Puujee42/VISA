"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import {
   Search,
   ArrowRight,
   Mail,
   Clock,
   User,
   Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

// --- TYPES ---
interface Post {
   _id: string;
   title: { [key: string]: string };
   excerpt: { [key: string]: string };
   author: string;
   date: string;
   image: string;
   category: string;
   slug: string;
}

export default function NewsClient() {
   const t = useTranslations("NewsPage");
   const locale = useLocale();

   const [posts, setPosts] = useState<Post[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");

   // FETCH BLOG POSTS
   useEffect(() => {
      fetch('/api/news')
         .then(res => res.json())
         .then(data => {
            if (Array.isArray(data)) setPosts(data);
         })
         .catch(err => console.error(err))
         .finally(() => setLoading(false));
   }, []);

   const filteredPosts = posts.filter(post => {
      const title = post.title[locale] || post.title["en"] || "";
      return title.toLowerCase().includes(searchQuery.toLowerCase());
   });

   const featuredPost = filteredPosts[0];
   const remainingPosts = filteredPosts.slice(1);

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-red-600" size={48} />
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-red-500 selection:text-white pb-20">

         {/* ─── 1. HERO / FEATURED ─── */}
         <section className="relative pt-32 pb-16 px-6 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
               <div className="text-center mb-16">
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-50 text-red-600 shadow-sm mb-6"
                  >
                     <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                     <span className="text-xs font-bold uppercase tracking-widest">{t("badge")}</span>
                  </motion.div>
                  <motion.h1
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter"
                  >
                     {t("heroTitle")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-emerald-600">{t("heroTitleHighlight")}</span>
                  </motion.h1>
               </div>

               {featuredPost && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 0.2 }}
                     className="relative aspect-[21/9] rounded-[3rem] overflow-hidden group shadow-2xl"
                  >
                     <Image
                        src={featuredPost.image}
                        alt={featuredPost.title[locale] || featuredPost.title["en"]}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                     <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full md:w-2/3">
                        <span className="inline-block px-4 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                           {featuredPost.category}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                           {featuredPost.title[locale] || featuredPost.title["en"]}
                        </h2>
                        <Link
                           href={`/news/${featuredPost.slug}`}
                           className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold hover:bg-emerald-500 hover:text-white transition-all group/btn"
                        >
                           {t("featured")} <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                     </div>
                  </motion.div>
               )}
            </div>
         </section>

         {/* ─── 2. SEARCH & FEED ─── */}
         <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">

               <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-4">
                  <h3 className="text-3xl font-black text-slate-900">{t("searchTitle")}</h3>
                  <div className="w-full md:w-96 relative group">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={20} />
                     <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-200 transition-all font-bold"
                     />
                  </div>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <AnimatePresence>
                     {remainingPosts.map((post, idx) => {
                        const titleText = post.title[locale] || post.title["en"];
                        const excerptText = post.excerpt[locale] || post.excerpt["en"];
                        return (
                           <motion.article
                              key={post._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:border-red-100 hover:shadow-2xl transition-all flex flex-col"
                           >
                              <div className="relative aspect-[4/3] overflow-hidden">
                                 <Image
                                    src={post.image}
                                    alt={titleText}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                 />
                                 <span className="absolute top-6 left-6 px-4 py-1 rounded-full bg-white/90 backdrop-blur text-red-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    {post.category}
                                 </span>
                              </div>
                              <div className="p-8 flex-1 flex flex-col">
                                 <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-4">
                                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(post.date).toLocaleDateString(locale)}</span>
                                    <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
                                 </div>
                                 <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-4 group-hover:text-red-600 transition-colors leading-tight line-clamp-2">
                                    {titleText}
                                 </h4>
                                 <p className="text-slate-500 font-medium mb-8 line-clamp-3">
                                    {excerptText}
                                 </p>
                                 <Link
                                    href={`/news/${post.slug}`}
                                    className="mt-auto inline-flex items-center gap-2 text-red-600 font-black uppercase tracking-widest text-xs hover:gap-3 transition-all"
                                 >
                                    {t("readMore")} <ArrowRight size={14} />
                                 </Link>
                              </div>
                           </motion.article>
                        );
                     })}
                  </AnimatePresence>
               </div>
            </div>
         </section>

         {/* ─── 3. NEWSLETTER / FOOTER AD ─── */}
         <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
               <div className="relative rounded-[4rem] bg-slate-900 p-12 md:p-20 overflow-hidden shadow-2xl">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px]" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                     <div className="text-center md:text-left space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black text-white">{t("newsletterTitle")}</h2>
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg">
                           {t("newsletterDesc")}
                        </p>
                     </div>
                     <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                           <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                           <input
                              type="email"
                              placeholder={t("emailPlaceholder")}
                              className="w-full sm:w-80 pl-14 pr-6 py-5 rounded-3xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:ring-4 focus:ring-red-500/20"
                           />
                        </div>
                        <button className="px-10 py-5 rounded-3xl bg-red-600 text-white font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg">
                           {t("register")}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </section>

      </div>
   );
}