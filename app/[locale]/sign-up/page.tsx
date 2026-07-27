"use client";

import React from "react";
import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import BeforeLoginNews from "@/app/components/BeforeLoginNews";
import PhoneAuthForm from "@/app/components/PhoneAuthForm";

export default function SignUpPage() {
  const t = useTranslations("Auth");

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col lg:flex-row">
      <div className="flex-1 flex items-start lg:items-center justify-center px-4 pt-24 pb-10 lg:py-16">
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00C896] mb-2">
              {t("future")}
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {t("signUpButton")}
            </h1>
            <p className="mt-2 text-slate-500 font-medium text-sm">
              Утас, нууц үгээ оруулаад бүртгүүлнэ.
            </p>
          </div>

          <PhoneAuthForm mode="sign-up" />
        </m.div>
      </div>

      <div className="hidden lg:flex lg:w-[42%] bg-slate-900 items-center justify-center p-10">
        <BeforeLoginNews />
      </div>
    </div>
  );
}
