"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Search, 
  Zap, 
  Filter,
  X,
  Clock,
  ArrowRight,
  Loader2
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";

// --- TYPES ---
type OpportunityType = 'all' | 'scholarship' | 'internship' | 'volunteer';

interface Opportunity {
  id: string;
  type: 'scholarship' | 'internship' | 'volunteer';
  title: { en: string; mn: string; de: string };
  provider: { en: string; mn: string; de: string };
  location: { en: string; mn: string; de: string };
  deadline: string;
  description: { en: string; mn: string; de: string };
  tags: string[];
  link: string;
}

// --- SUB-COMPONENT: OPPORTUNITY CARD ---
const OpportunityCard = ({ opp, locale, isDark }: { opp: Opportunity, locale: string, isDark: boolean }) => {
  const t = useTranslations("opportunities");
  const Icon = opp.type === 'scholarship' ? GraduationCap : opp.type === 'internship' ? Briefcase : Heart;
  const typeColor = opp.type === 'scholarship' ? "text-purple-500" : opp.type === 'internship' ? "text-blue-500" : "text-rose-500";
  const typeBg = opp.type === 'scholarship' ? "bg-purple-500/10" : opp.type === 'internship' ? "bg-blue-500/10" : "bg-rose-500/10";

  // Safely access localized content
  const title = opp.title[locale as keyof typeof opp.title] || opp.title.en;
  const provider = opp.provider[locale as keyof typeof opp.provider] || opp.provider.en;
  const description = opp.description[locale as keyof typeof opp.description] || opp.description.en;

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative group rounded-[2.5rem] border p-8 transition-all duration-500 overflow-hidden h-full flex flex-col
        ${isDark 
          ? "bg-[#001d30]/60 border-white/5 shadow-2xl hover:border-[#00aeef]/40" 
          : "bg-white border-slate-200 shadow-xl shadow-slate-200/40 hover:border-[#00aeef]/40"}`}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-3xl transition-colors ${typeBg}`}>
            <Icon size={28} className={typeColor} />
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
             <Clock size={12} className="text-[#00aeef]" />
             <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                {t('deadline')}: {opp.deadline}
             </span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className={`text-xl font-black mb-2 tracking-tight leading-tight line-clamp-2 ${isDark ? "text-white" : "text-[#001829]"}`}>
            {title}
          </h3>
          <p className={`text-xs font-bold flex items-center gap-2 ${isDark ? "text-[#00aeef]" : "text-[#00aeef]"}`}>
            <span className={`opacity-40 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white" : "text-slate-900"}`}>
                {t('provider')}:
            </span>
            {provider}
          </p>
        </div>

        <p className={`text-sm opacity-60 leading-relaxed mb-6 line-clamp-3 ${isDark ? "text-white" : "text-slate-600"}`}>
          {description}
        </p>

        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-8">
            {opp.tags.map(tag => (
              <span key={tag} className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${isDark ? "bg-white/5 text-white/40" : "bg-slate-100 text-slate-400"}`}>
                #{tag}
              </span>
            ))}
          </div>

          <Link href={`/opportunities/${opp.id}`} className={`w-full py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all
            ${isDark 
              ? "border-white/10 text-white hover:bg-[#00aeef] hover:border-[#00aeef]" 
              : "border-slate-200 text-[#001829] hover:bg-[#001829] hover:text-white"}`}>
            {t('details')}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </m.div>
  );
};

// --- MAIN PAGE ---
export default function OpportunitiesClient() {
  const t = useTranslations("opportunities");
  const locale = useLocale();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OpportunityType>('all');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/opportunities');
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const isDark = theme === "dark" || !theme;

  const filteredOpps = opportunities.filter(opp => {
    const title = opp.title[locale as keyof typeof opp.title] || opp.title.en;
    const provider = opp.provider[locale as keyof typeof opp.provider] || opp.provider.en;
    
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                         provider.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || opp.type === filter;
    return matchesSearch && matchesFilter;
  });

  const filterTabs = [
    { id: 'all', label: t('all') },
    { id: 'scholarship', label: t('scholarships') },
    { id: 'internship', label: t('internships') },
    { id: 'volunteer', label: t('volunteering') }
  ] as const;

  return (
    <div className={`min-h-[100dvh] transition-colors duration-700 pt-32 pb-20 px-6 font-sans
      ${isDark ? "bg-[#001829] text-white" : "bg-slate-50 text-slate-900"}`}>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] transition-opacity duration-700
          ${isDark ? "bg-[#00aeef] opacity-[0.05]" : "bg-sky-200 opacity-[0.3]"}`} />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-20">
          <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors mb-6
              ${isDark ? "bg-[#00aeef]/10 border-[#00aeef]/30 text-[#00aeef]" : "bg-white border-sky-100 text-[#00aeef] shadow-sm"}`}
          >
            <Zap size={14} className="fill-current" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">
               {t('badge')}
            </span>
          </m.div>

          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]
              ${isDark ? "text-white" : "text-[#001829]"}`}
          >
            {t('titleMain')} <span className="text-[#00aeef]">{t('titleHighlight')}</span>{t('titleEnd')}
          </m.h1>

          {/* SEARCH BAR */}
          <m.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto relative group"
          >
            <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors
              ${isDark ? "text-white/20 group-focus-within:text-[#00aeef]" : "text-slate-400 group-focus-within:text-[#00aeef]"}`} size={20} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full py-6 pl-16 pr-6 rounded-[2rem] border text-sm font-bold transition-all focus:outline-none focus:ring-4
                ${isDark 
                  ? "bg-white/5 border-white/10 text-white focus:border-[#00aeef] focus:ring-[#00aeef]/10 placeholder:text-white/20" 
                  : "bg-white border-slate-200 text-[#001829] focus:border-[#00aeef] focus:ring-sky-100 placeholder:text-slate-400 shadow-xl shadow-slate-200/50"}`}
            />
            {search && (
                <button onClick={() => setSearch("")} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 rounded-full transition-colors">
                    <X size={18} className="opacity-40" />
                </button>
            )}
          </m.div>

          {/* FILTER TABS */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as OpportunityType)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${filter === tab.id 
                    ? "bg-[#00aeef] text-white shadow-xl shadow-[#00aeef]/20 scale-105" 
                    : isDark ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS SUMMARY */}
        <div className="flex items-center gap-4 mb-8 px-4">
            <Filter size={14} className="opacity-40" />
            <span className="text-xs font-black uppercase tracking-widest opacity-40">
                {filteredOpps.length} {t('found')}
            </span>
            {loading && <span className="text-xs font-bold text-[#00aeef] animate-pulse ml-2">Syncing...</span>}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
               <div className="col-span-full py-20 flex justify-center">
                  <Loader2 className="animate-spin text-[#00aeef]" size={32} />
               </div>
            ) : filteredOpps.length > 0 ? (
              filteredOpps.map((opp) => (
                <OpportunityCard 
                    key={opp.id} 
                    opp={opp} 
                    locale={locale} 
                    isDark={isDark} 
                />
              ))
            ) : (
              <m.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="col-span-full py-32 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="opacity-20" size={40} />
                </div>
                <p className="opacity-30 italic font-medium">{t('noResults')}</p>
              </m.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}