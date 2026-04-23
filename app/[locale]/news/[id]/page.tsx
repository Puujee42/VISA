"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { 
  Calendar, 
  User, 
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
  MessageCircle
} from "lucide-react";
import { m, useScroll, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

interface NewsArticle {
  _id: string;
  title: { en: string; mn: string; de: string };
  summary: { en: string; mn: string; de: string };
  content: { en: string; mn: string; de: string };
  author: string;
  publishedDate: string;
  image: string;
  tags: string[];
  featured: boolean;
}

export default function NewsDetail() {
  const t = useTranslations("news");
  const locale = useLocale() as "en" | "mn" | "de";
  const params = useParams();
  const { theme } = useTheme();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const [mounted, setMounted] = useState(false);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && (theme === "dark" || !theme);
  const id = params.id as string;

  useEffect(() => {
    async function fetchArticle() {
      if (!id) return;
      try {
        const res = await fetch(`/api/news/${id}`);
        if (res.ok) {
          const json = await res.json();
          setArticle(json);
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    }
    fetchArticle();
  }, [id]);

  // Calculate reading time
  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const noOfWords = text.split(/\s/g).length;
    return Math.ceil(noOfWords / wordsPerMinute);
  };

  if (!mounted || loading) {
    return (
      <div className={`min-h-[100dvh] flex items-center justify-center ${isDark ? "bg-[#001829]" : "bg-slate-50"}`}>
        <Loader2 className="w-10 h-10 text-[#00aeef] animate-spin" />
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className={`min-h-[100dvh] transition-colors duration-700 pt-20 pb-20 font-sans
      ${isDark ? "bg-[#001829] text-white" : "bg-white text-slate-900"}`}>
      
      {/* READING PROGRESS BAR */}
      <m.div className="fixed top-0 left-0 right-0 h-1.5 bg-[#00aeef] z-[60] origin-left" style={{ scaleX }} />

      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 pointer-events-none fixed overflow-hidden">
         <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] transition-opacity duration-700
            ${isDark ? "bg-[#00aeef] opacity-[0.05]" : "bg-sky-100 opacity-[0.4]"}`} />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* NAVIGATION & META */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <Link href="/news" className={`group inline-flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all
              ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}>
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-[#00aeef]" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t("back")}</span>
           </Link>

           <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                 <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-1`}>{t("author")}</span>
                 <p className="text-sm font-bold text-[#00aeef]">{article.author}</p>
              </div>
              <div className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                 <Image 
                    src={`https://ui-avatars.com/api/?name=${article.author}&background=00aeef&color=fff`} 
                    alt="Author" 
                    fill
                    className="object-cover"
                 />
              </div>
           </div>
        </div>

        {/* TITLE & SUMMARY */}
        <div className="max-w-4xl mb-16">
           <div className="flex items-center gap-3 text-[#00aeef] mb-6">
              <div className="px-3 py-1 rounded-lg bg-[#00aeef]/10 border border-[#00aeef]/20 text-[10px] font-black uppercase tracking-widest">
                 {article.tags[0]}
              </div>
              <span className="w-1 h-1 rounded-full bg-current opacity-40" />
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                 <Clock size={12} />
                 {getReadingTime(article.content[locale] || article.content.en)} {t("readingTime")}
              </div>
           </div>

           <m.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className={`text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-10 ${isDark ? "text-white" : "text-[#001829]"}`}>
              {article.title[locale] || article.title.en}
           </m.h1>

           <p className={`text-xl md:text-2xl font-medium leading-relaxed opacity-70 ${isDark ? "text-white" : "text-slate-600"}`}>
              {article.summary[locale] || article.summary.en}
           </p>
        </div>

        {/* FEATURED IMAGE */}
        <m.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-[21/9] w-full rounded-[4rem] overflow-hidden mb-20 shadow-3xl border border-white/5"
        >
           <Image 
              src={optimizeCloudinaryUrl(article.image)} 
              alt="Hero" 
              fill
              className="object-cover"
              sizes="100vw"
              priority
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </m.div>

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
           
           {/* CONTENT AREA */}
           <article className="lg:col-span-8">
              <div className="space-y-10">
                 {(article.content[locale] || article.content.en).split('\n').map((para, i) => (
                    para.trim() && (
                      <m.p 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className={`text-lg md:text-xl leading-[1.8] font-medium transition-colors
                           ${isDark ? "text-white/80" : "text-slate-700"}`}
                      >
                         {para}
                      </m.p>
                    )
                 ))}
              </div>

              {/* ARTICLE TAGS */}
              <div className={`mt-20 pt-10 border-t ${isDark ? "border-white/5" : "border-slate-100"} flex flex-wrap gap-3`}>
                 {article.tags.map(tag => (
                    <span key={tag} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all
                       ${isDark ? "bg-white/5 border-white/10 hover:border-[#00aeef] text-white/50" : "bg-slate-50 border-slate-200 hover:border-[#00aeef] text-slate-500"}`}>
                       #{tag}
                    </span>
                 ))}
              </div>
           </article>

           {/* SIDEBAR TOOLS */}
           <aside className="lg:col-span-4">
              <div className="sticky top-32 space-y-10">
                 
                 {/* Sharing Card */}
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
                    <button className={`w-full mt-6 py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest
                       ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-white"}`}>
                       <Bookmark size={14} className="text-[#00aeef]" />
                       {t("saveArticle")}
                    </button>
                 </div>

                 {/* Subscription Card */}
                 <div className={`relative p-8 rounded-[3rem] overflow-hidden group
                    ${isDark ? "bg-[#00aeef] text-white shadow-sky-500/20 shadow-2xl" : "bg-[#001829] text-white"}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[60px] rounded-full pointer-events-none" />
                    <Zap size={32} fill="currentColor" className="mb-6" />
                    <h4 className="text-2xl font-black tracking-tight mb-3 leading-tight">{t("subscribe")}</h4>
                    <p className="text-xs font-bold opacity-80 mb-8 leading-relaxed">
                       {t("subscribeDesc")}
                    </p>
                    <div className="space-y-3">
                       <input 
                          type="email" 
                          placeholder={t("placeholderEmail")}
                          className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-sm outline-none placeholder:text-white/40 focus:bg-white/20 transition-all"
                       />
                       <button className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl
                          ${isDark ? "bg-white text-[#00aeef]" : "bg-[#00aeef] text-white"}`}>
                          {t("joinCommunity")}
                       </button>
                    </div>
                 </div>

                 {/* Comments Placeholder */}
                 <div className="px-6 flex items-center justify-between opacity-40">
                    <div className="flex items-center gap-2">
                       <MessageCircle size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{t("comments")} (0)</span>
                    </div>
                    <Link href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-[#00aeef]">{t("write")}</Link>
                 </div>

              </div>
           </aside>

        </div>
      </div>
    </div>
  );
}

