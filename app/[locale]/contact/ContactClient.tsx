"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Copy
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function ContactClient() {
  const t = useTranslations("ContactPage");
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const CONTACT_INFO = [
    {
      id: "phone",
      label: t("info.phone.label"),
      value: t("info.phone.value"),
      link: "tel:+97677116906",
      icon: Phone,
      color: "bg-red-50 text-[#E31B23]",
      border: "hover:border-[#E31B23]"
    },
    {
      id: "email",
      label: t("info.email.label"),
      value: t("info.email.value"),
      link: "mailto:info@mongolianaupair.com",
      icon: Mail,
      color: "bg-emerald-50 text-[#00C896]",
      border: "hover:border-[#00C896]"
    },
    {
      id: "address",
      label: t("info.address.label"),
      value: t("info.address.value"),
      link: "https://maps.google.com",
      icon: MapPin,
      color: "bg-slate-100 text-slate-700",
      border: "hover:border-slate-400"
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] font-sans text-slate-900 selection:bg-[#E31B23] selection:text-white pt-28 pb-12 px-6 overflow-hidden">

      {/* ─── ATMOSPHERE ─── */}
      <div className="fixed inset-0 pointer-events-none">
        <m.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#E31B23] rounded-full blur-[200px] opacity-[0.04]"
        />
        <m.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#00C896] rounded-full blur-[150px] opacity-[0.04]"
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ─── HEADER ─── */}
        <div className="text-center mb-20">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31B23] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E31B23]"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{t("badge")}</span>
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6"
          >
            {t("heroTitle")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31B23] to-rose-400">{t("heroTitleHighlight")}</span>
          </m.h1>

          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto"
          >
            {t("heroDesc")}
          </m.p>
        </div>

        {/* ─── GRID CONTENT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* LEFT: INFO CARDS */}
          <div className="space-y-6">
            {CONTACT_INFO.map((item, i) => (
              <m.div
                key={item.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`group relative bg-white p-6 md:p-8 rounded-[2rem] border-2 border-transparent shadow-sm hover:shadow-xl transition-all duration-300 ${item.border}`}
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{item.label}</p>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-tight mb-2 break-words">{item.value}</h3>

                    <div className="flex gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                      <button
                        onClick={() => handleCopy(item.value, item.id)}
                        className="text-xs font-bold flex items-center gap-1 text-slate-400 hover:text-[#E31B23] transition-colors"
                      >
                        {copied === item.id ? <CheckCircle2 size={14} className="text-[#00C896]" /> : <Copy size={14} />}
                        {copied === item.id ? t("copied") : t("copy")}
                      </button>
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-xs font-bold flex items-center gap-1 text-slate-400 hover:text-[#00C896] transition-colors">
                        <ArrowRight size={14} /> {t("openLink")}
                      </a>
                    </div>
                  </div>
                </div>
              </m.div>
            ))}

            {/* Social Proof */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-8 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E31B23] rounded-full blur-[60px] opacity-20" />

              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-black mb-2">{t("followTitle")}</h4>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t("followHandle")}</p>
                </div>
                <div className="flex gap-2">
                  {[FaFacebookF, FaInstagram, FaTwitter].map((Icon, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E31B23] flex items-center justify-center cursor-pointer transition-colors backdrop-blur-md">
                      <Icon size={16} />
                    </div>
                  ))}
                </div>
              </div>
            </m.div>
          </div>

          {/* RIGHT: FORM */}
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100 relative overflow-hidden"
          >
            {/* Decor */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#E31B23] via-[#00C896] to-slate-900" />

            <div className="relative z-10">
              <h3 className="text-3xl font-black text-slate-900 mb-2">{t("formTitle")}</h3>
              <p className="text-slate-500 font-medium mb-10">{t("formDesc")}</p>

              <AnimatePresence mode="wait">
                {success ? (
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-[#00C896] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-4xl shadow-xl shadow-green-200">
                      <CheckCircle2 />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2">{t("successTitle")}</h4>
                    <p className="text-slate-500 font-medium">{t("successDesc")}</p>
                    <button onClick={() => setSuccess(false)} className="mt-8 text-xs font-bold text-[#E31B23] uppercase tracking-widest hover:underline">{t("sendAnother")}</button>
                  </m.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">{t("labels.name")}</label>
                        <input
                          required
                          value={formState.name}
                          onChange={e => setFormState({ ...formState, name: e.target.value })}
                          className="w-full bg-[#FAFAFA] border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:border-[#E31B23] focus:bg-white transition-all"
                          placeholder={t("placeholders.name")}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">{t("labels.email")}</label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={e => setFormState({ ...formState, email: e.target.value })}
                          className="w-full bg-[#FAFAFA] border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:border-[#00C896] focus:bg-white transition-all"
                          placeholder={t("placeholders.email")}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest ml-1">{t("labels.message")}</label>
                      <textarea
                        required
                        rows={5}
                        value={formState.message}
                        onChange={e => setFormState({ ...formState, message: e.target.value })}
                        className="w-full bg-[#FAFAFA] border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all resize-none"
                        placeholder={t("placeholders.message")}
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl hover:bg-[#E31B23] hover:shadow-red-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <>{t("buttons.send")} <Send size={18} /></>}
                      </button>
                    </div>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </m.div>

        </div>
      </div>
    </div>
  );
}