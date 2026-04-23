"use client";

import React, { useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import {
  UserPlus,
  LogIn,
  ArrowRight,
  CheckCircle2,
  ChevronLeft
} from "lucide-react";
import BeforeLoginNews from "@/app/components/BeforeLoginNews";

// --- OPTIONS ---
const OPTIONS = [
  {
    id: "new",
    title: "Би шинэ гишүүн",
    desc: "Анкет бөглөх, хөтөлбөрт бүртгүүлэх.",
    icon: UserPlus,
    badge: "Санал болгож буй",
  },
  {
    id: "existing",
    title: "Би гишүүн болсон",
    desc: "Профайл руу нэвтрэх, төлөв шалгах.",
    icon: LogIn,
    badge: null,
  }
];

export default function RegisterPage() {
  const [selected, setSelected] = useState<string>("new");

  return (
    <div className="min-h-[100dvh] w-full flex bg-[#FDFBF7] font-sans selection:bg-red-500 selection:text-white overflow-hidden">

      {/* ─── LEFT: INTERACTIVE FORM (50%) ─── */}
      <div className="w-full lg:w-1/2 p-8 lg:p-20 flex flex-col justify-center relative z-10">

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-50 -z-10" />

        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto w-full"
        >
          {/* Header */}
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-[1.1]">
            Та хэрхэн <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
              Нэгдэхийг
            </span> хүсч байна вэ?
          </h1>

          <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed">
            Бид таны бүртгэлийн үйл явцыг танд тохируулан бэлдэх болно.
          </p>

          {/* Selection Cards */}
          <div className="space-y-6 mb-12">
            {OPTIONS.map((option) => {
              const isActive = selected === option.id;

              return (
                <div key={option.id} className="relative group">
                  {/* Badge */}
                  {option.badge && (
                    <div className="absolute -top-3 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-20">
                      {option.badge}
                    </div>
                  )}

                  {/* Card Area */}
                  <div
                    onClick={() => setSelected(option.id)}
                    className={`
                      relative cursor-pointer p-6 rounded-[2rem] border-2 transition-all duration-300 ease-out flex items-center gap-6 overflow-hidden
                      ${isActive
                        ? "border-red-500 bg-white shadow-[0_20px_40px_-10px_rgba(227,0,45,0.15)] scale-[1.02]"
                        : "border-slate-100 bg-white hover:border-red-200 hover:shadow-lg"
                      }
                    `}
                  >
                    {/* Active Gradient Glow behind */}
                    {isActive && (
                      <m.div
                        layoutId="activeGlow"
                        className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent opacity-50"
                      />
                    )}

                    {/* Icon Box */}
                    <div className={`
                      relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-colors duration-300
                      ${isActive ? "bg-red-600 text-white shadow-lg shadow-red-200" : "bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-500"}
                    `}>
                      <option.icon size={28} />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 relative z-10">
                      <h3 className={`text-xl font-black mb-1 ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                        {option.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
                        {option.desc}
                      </p>
                    </div>

                    {/* Radio Checkmark */}
                    <div className={`
                      relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${isActive ? "border-red-500 bg-red-500 text-white" : "border-slate-200 bg-transparent text-transparent"}
                    `}>
                      <CheckCircle2 size={16} strokeWidth={4} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <Link href={selected === "new" ? "/sign-up" : "/sign-in"}>
            <m.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 rounded-[1.5rem] bg-slate-900 text-white font-black text-lg uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-red-600 transition-colors duration-300 group"
            >
              {selected === "new" ? "Бүртгэл Үүсгэх" : "Нэвтрэх"}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </m.button>
          </Link>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-800 uppercase tracking-widest transition-colors">
              <ChevronLeft size={14} /> Нүүр хуудас руу буцах
            </Link>
          </div>

        </m.div>
      </div>

      {/* ─── RIGHT: VISUAL EXPERIENCE (50%) ─── */}
      <div className="hidden lg:flex w-1/2 bg-[#EFF6FF] relative items-center justify-center overflow-hidden">

        {/* Background Gradient Mesh */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500 rounded-full blur-[100px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-emerald-400 rounded-full blur-[100px] opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        </div>

        <BeforeLoginNews />

      </div>

    </div>
  );
}