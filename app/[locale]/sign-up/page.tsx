"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { useSignUp } from "@clerk/nextjs";
import {
   ChevronLeft,
   User,
   Mail,
   Lock,
   ArrowRight,
   Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import BeforeLoginNews from "../../components/BeforeLoginNews";

export default function AuPairRegisterPage() {
   const t = useTranslations("Auth");
   const router = useRouter();
   const { isLoaded, signUp, setActive } = useSignUp();

   // --- FORM STATE ---
   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");

   // --- UI STATE ---
   const [error, setError] = useState("");
   const [isLoading, setIsLoading] = useState(false);

   // --- HANDLERS ---
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoaded || isLoading) return;

      setIsLoading(true);
      setError("");

      try {
         console.log("--- Starting Sign Up ---");
         const result = await signUp.create({
            emailAddress: email,
            password,
            firstName: fullName.split(" ")[0],
            lastName: fullName.split(" ")[1] || "",
         });

         console.log("Clerk SignUp Result:", result);

         // If verification is disabled in Clerk, status should be complete immediately
         if (result.status === "complete") {
            console.log("Sign up complete, setting active session...");
            await setActive({ session: result.createdSessionId });

            // Sync user to DB
            try {
               console.log("Attempting to sync with DB...");
               const syncRes = await fetch('/api/user/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fullName })
               });
               const syncData = await syncRes.json();
               if (!syncRes.ok) {
                  console.error("Sync API error details:", syncData);
                  // Optional: setError("Sync failed, but account created.");
               } else {
                  console.log("DB Sync successful:", syncData);
               }
            } catch (syncErr) {
               console.error("DB Sync fetch exception:", syncErr);
            }

            router.push("/dashboard");
         } else if (result.status === "missing_requirements") {
            console.warn("Sign up missing requirements:", result.missingFields);
            setError("Missing required fields for registration.");
         } else {
            // This is where "Registration incomplete" usually happens
            console.error("Unexpected Sign up status:", result.status);
            console.log("Verification info:", result.verifications);

            if (result.verifications.emailAddress?.status === "unverified") {
               setError("Email verification required. Please check your inbox or Clerk settings.");
            } else {
               setError(`Registration incomplete (Status: ${result.status}). Check Clerk dashboard settings.`);
            }
         }
      } catch (err: any) {
         console.error("Sign up submission error:", err);
         setError(err.errors?.[0]?.longMessage || "Registration failed.");
      } finally { setIsLoading(false); }
   };

   return (
      <div className="min-h-[100dvh] w-full flex font-sans selection:bg-red-500 selection:text-white overflow-hidden bg-[#FDFBF7]">

         {/* ─── LEFT: FORM SECTION (50%) ─── */}
         <div className="w-full lg:w-1/2 p-6 lg:p-16 flex flex-col justify-center relative z-20">

            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-50 -z-10" />

            <m.div
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, ease: "easeOut" }}
               className="max-w-md mx-auto w-full"
            >
               {/* Back Nav */}
               <div className="mb-8">
                  <Link
                     href="/"
                     className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-[0.2em] transition-colors group"
                  >
                     <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                     {t('home')}
                  </Link>
               </div>

               {/* Header */}
               <div className="mb-10 relative">
                  <m.div
                     initial={{ scale: 0 }} animate={{ scale: 1 }}
                     className="absolute -top-10 -left-10 w-24 h-24 bg-red-100 rounded-full blur-3xl opacity-50"
                  />
                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-3 tracking-tight leading-[0.95] relative z-10">
                     {t('future')} <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
                        Au Pair.
                     </span>
                  </h1>
                  <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm relative z-10">
                     {t('signupSubtitle')}
                  </p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-5">

                  {/* FULL NAME */}
                  <div className="relative group">
                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
                        <User size={20} />
                     </div>
                     <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('fullNamePlaceholder')}
                        className="w-full bg-white border-2 border-slate-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] outline-none"
                        required
                     />
                  </div>

                  {/* EMAIL */}
                  <div className="relative group">
                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
                        <Mail size={20} />
                     </div>
                     <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        className="w-full bg-white border-2 border-slate-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] outline-none"
                        required
                     />
                  </div>

                  {/* PASSWORD */}
                  <div className="relative group">
                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
                        <Lock size={20} />
                     </div>
                     <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('passwordPlaceholder')}
                        className="w-full bg-white border-2 border-slate-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] outline-none"
                        required
                     />
                  </div>

                  {/* ERROR MSG */}
                  {error && (
                     <m.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-red-500 text-[11px] font-black uppercase tracking-wider bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                        {error}
                     </m.p>
                  )}

                  {/* SUBMIT BUTTON */}
                  <button
                     type="submit"
                     disabled={isLoading}
                     className="w-full bg-slate-900 hover:bg-red-600 text-white font-black text-xs uppercase tracking-[0.25em] py-6 rounded-[1.5rem] shadow-xl hover:shadow-2xl hover:shadow-red-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 group"
                  >
                     {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                        <>{t('signUpButton')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                     )}
                  </button>

                  {/* Clerk CAPTCHA Placeholder */}
                  <div id="clerk-captcha" />

               </form>

               {/* Login Link */}
               <div className="mt-8 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                     {t('alreadyHaveAccount')}
                     <Link href="/sign-in" className="text-red-500 ml-2 hover:text-slate-900 transition-colors underline decoration-2 underline-offset-4">{t('signIn')}</Link>
                  </p>
               </div>

            </m.div>
         </div>

         {/* ─── RIGHT: VISUAL SECTION (50%) ─── */}
         <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-[#F2F5F8] border-l border-white/50 overflow-hidden">

            {/* Animated Gradients */}
            <div className="absolute inset-0 w-full h-full">
               <m.div
                  animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] bg-red-200 rounded-full blur-[100px] opacity-40"
               />
               <m.div
                  animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
                  transition={{ duration: 15, repeat: Infinity }}
                  className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-200 rounded-full blur-[100px] opacity-40"
               />
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
            </div>

            <BeforeLoginNews />

         </div>

      </div>
   );
}