"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
   UserPlus,
   LogIn,
   ArrowRight,
   CheckCircle2,
   Sparkles
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export default function JoinPage() {
   const t = useTranslations("Auth");
   const locale = useLocale();
   const { theme } = useTheme();
   const router = useRouter();

   const [selected, setSelected] = useState<'signup' | 'signin'>('signup');
   const [mounted, setMounted] = useState(false);

   useEffect(() => setMounted(true), []);

   if (!mounted) return null;

   const isDark = theme === "dark" || !theme;

   const handleContinue = () => {
      if (selected === 'signup') {
         router.push('/sign-up');
      } else {
         router.push('/sign-in');
      }
   };

   return (
      <div className={`min-h-[100dvh] w-full flex overflow-hidden font-sans transition-colors duration-700
      ${isDark ? "bg-[#001829] text-white" : "bg-slate-50 text-slate-900"}`}>

         {/* --- LEFT COLUMN: INTERACTION --- */}
         <div className="w-full lg:w-[55%] xl:w-[50%] relative flex flex-col justify-center px-8 md:px-16 lg:px-24 z-10">

            {/* Background Noise & Grid */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay pointer-events-none" />
            <div className={`absolute inset-0 opacity-[0.02] pointer-events-none ${isDark ? "invert-0" : "invert"}`}
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%2300aeef' fill-opacity='1'/%3E%3C/svg%3E")` }} />

            {/* Main Content Form */}
            <div className="max-w-lg w-full py-20 relative z-10">
               <m.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`text-4xl md:text-6xl font-black tracking-tighter mb-6 transition-colors duration-500
                ${isDark ? "text-white" : "text-[#001829]"}`}
               >
                  {t("joinTitle")}
               </m.h1>
               <m.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-lg mb-12 font-medium opacity-60 transition-colors duration-500
                ${isDark ? "text-white" : "text-slate-600"}`}
               >
                  {t("signupSubtitle")}
               </m.p>

               {/* OPTION CARDS */}
               <div className="space-y-6">

                  {/* Option 1: Sign Up */}
                  <m.div
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.3 }}
                     onClick={() => setSelected('signup')}
                     className={`relative group p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 flex items-start gap-6
                  ${selected === 'signup'
                           ? "bg-[#00aeef]/10 border-[#00aeef] shadow-2xl shadow-[#00aeef]/20"
                           : isDark
                              ? "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                              : "bg-white border-slate-200 hover:border-sky-200 shadow-sm"}
                `}
                  >
                     <div className={`p-4 rounded-2xl transition-all duration-300 shadow-lg
                    ${selected === 'signup'
                           ? "bg-[#00aeef] text-white scale-110"
                           : isDark ? "bg-white/5 text-white/40" : "bg-slate-100 text-slate-400"}`}>
                        <UserPlus size={24} strokeWidth={2.5} />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                           <h3 className={`font-black text-xl tracking-tight transition-colors
                          ${isDark ? "text-white" : "text-[#001829]"}`}>
                              {t("newMemberTitle")}
                           </h3>
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all 
                          ${selected === 'signup' ? "border-[#00aeef] bg-[#00aeef]" : isDark ? "border-white/20" : "border-slate-300"}`}>
                              {selected === 'signup' && <CheckCircle2 size={14} className="text-white" />}
                           </div>
                        </div>
                        <p className={`text-sm font-medium opacity-50 ${isDark ? "text-white" : "text-slate-500"}`}>
                           {t("newMemberDesc")}
                        </p>
                     </div>

                     {/* Badge */}
                     <div className="absolute -top-3 right-8 bg-[#00aeef] text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-xl">
                        {t("recommended")}
                     </div>
                  </m.div>

                  {/* Option 2: Sign In */}
                  <m.div
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.4 }}
                     onClick={() => setSelected('signin')}
                     className={`relative group p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 flex items-start gap-6
                  ${selected === 'signin'
                           ? "bg-[#00aeef]/10 border-[#00aeef] shadow-2xl shadow-[#00aeef]/20"
                           : isDark
                              ? "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                              : "bg-white border-slate-200 hover:border-sky-200 shadow-sm"}
                `}
                  >
                     <div className={`p-4 rounded-2xl transition-all duration-300 shadow-lg
                    ${selected === 'signin'
                           ? "bg-[#00aeef] text-white scale-110"
                           : isDark ? "bg-white/5 text-white/40" : "bg-slate-100 text-slate-400"}`}>
                        <LogIn size={24} strokeWidth={2.5} />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                           <h3 className={`font-black text-xl tracking-tight transition-colors
                          ${isDark ? "text-white" : "text-[#001829]"}`}>
                              {t("existingMemberTitle")}
                           </h3>
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all 
                          ${selected === 'signin' ? "border-[#00aeef] bg-[#00aeef]" : isDark ? "border-white/20" : "border-slate-300"}`}>
                              {selected === 'signin' && <CheckCircle2 size={14} className="text-white" />}
                           </div>
                        </div>
                        <p className={`text-sm font-medium opacity-50 ${isDark ? "text-white" : "text-slate-500"}`}>
                           {t("existingMemberDesc")}
                        </p>
                     </div>
                  </m.div>

               </div>

               {/* Continue Button */}
               <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-12"
               >
                  <button
                     onClick={handleContinue}
                     className="w-full bg-[#00aeef] hover:bg-[#009bd5] text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-[2rem] shadow-2xl shadow-[#00aeef]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                  >
                     {selected === 'signup' ? t("signUpButton") : t("signIn")}
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </m.div>

               {/* Footer Link */}
               <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-10 text-center"
               >
                  <Link href="/" className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors
                 ${isDark ? "text-white/30 hover:text-white" : "text-slate-400 hover:text-[#001829]"}`}>
                     {t("home")}
                  </Link>
               </m.div>

            </div>
         </div>

         {/* --- RIGHT COLUMN: VISUAL ATMOSPHERE --- */}
         <div className={`hidden lg:block w-[45%] xl:w-[50%] relative overflow-hidden transition-colors duration-700
         ${isDark ? "bg-[#00101a]" : "bg-sky-50"}`}>

            {/* Animated Glows */}
            <m.div
               animate={{ scale: [1, 1.1, 1], opacity: isDark ? [0.3, 0.5, 0.3] : [0.4, 0.6, 0.4] }}
               transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
               className={`absolute -top-[20%] -right-[20%] w-[1000px] h-[1000px] rounded-full blur-[100px] 
               ${isDark ? "bg-[#00aeef]" : "bg-sky-300"}`}
            />
            <m.div
               animate={{ scale: [1, 1.2, 1], opacity: isDark ? [0.2, 0.4, 0.2] : [0.3, 0.5, 0.3] }}
               transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
               className={`absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[120px] 
               ${isDark ? "bg-[#005691]" : "bg-blue-200"}`}
            />

            {/* Abstract Glass Card */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
               <m.div
                  initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ duration: 1.5, type: "spring" }}
                  className={`relative w-[420px] h-[540px] border rounded-[3.5rem] backdrop-blur-lg shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col items-center justify-center text-center p-14
                  ${isDark ? "bg-white/5 border-white/10" : "bg-white/40 border-white/50"}`}
               >
                  {/* Accent Blobs Inside Card */}
                  <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#00aeef] rounded-full blur-xl opacity-30" />
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#fbbf24] rounded-full blur-xl opacity-20" />

                  <div className="relative z-10 space-y-8">
                     <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#00aeef] to-[#00dbde] flex items-center justify-center mx-auto shadow-2xl shadow-[#00aeef]/40 animate-float-slow rotate-12">
                        <Sparkles size={40} className="text-white" />
                     </div>

                     <div className="space-y-4">
                        <h2 className={`text-5xl font-black leading-none tracking-tighter ${isDark ? "text-white" : "text-[#001829]"}`}>
                           For Every <br />
                           <span className="text-[#00aeef]">Child</span>
                        </h2>
                        <p className={`text-base font-medium leading-relaxed opacity-60 ${isDark ? "text-white" : "text-slate-600"}`}>
                           Join a global network of changemakers dedicated to building a brighter future.
                        </p>
                     </div>

                     <div className={`h-1 w-20 rounded-full mx-auto ${isDark ? "bg-white/20" : "bg-[#001829]/10"}`} />
                  </div>
               </m.div>
            </div>
         </div>

      </div>
   );
}