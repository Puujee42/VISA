"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/navigation";
import {
  ArrowRight,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { normalizePhone, phoneToEmail } from "@/lib/phone";

type Props = {
  mode: "sign-in" | "sign-up";
  redirectTo?: string | null;
};

function networkHint(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err || "");
  if (
    /failed to fetch|networkerror|fetch failed|enotfound|timed out|timeout/i.test(
      msg,
    )
  ) {
    return "Сервертэй холбогдож чадсангүй. Интернэт эсвэл Supabase тохиргоогоо шалгана уу.";
  }
  return msg || "Алдаа гарлаа";
}

export default function PhoneAuthForm({ mode, redirectTo }: Props) {
  const t = useTranslations("Auth");
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const finishRedirect = (role?: string) => {
    if (role === "admin") {
      router.push("/admin");
    } else if (redirectTo?.includes("/admin")) {
      router.push("/dashboard");
    } else if (mode === "sign-up") {
      router.push("/apply");
    } else {
      router.push(redirectTo || "/dashboard");
    }
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const normalized = normalizePhone(phone);
    if (normalized.length < 8) {
      setError("Утасны дугаар 8 оронтой байх ёстой.");
      return;
    }
    if (password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгт байна.");
      return;
    }
    if (mode === "sign-up" && !fullName.trim()) {
      setError("Нэрээ оруулна уу.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "sign-up"
          ? "/api/auth/phone/register"
          : "/api/auth/phone/login";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalized,
          password,
          fullName: fullName.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Амжилтгүй");

      if (!data.sessionSet) {
        const supabase = createClient();
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: data.email || phoneToEmail(normalized),
          password,
        });
        if (signInErr) {
          if (mode === "sign-up") {
            router.push("/sign-in");
            return;
          }
          throw signInErr;
        }
      }

      finishRedirect(data.role);
    } catch (err: unknown) {
      setError(networkHint(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
    >
      {mode === "sign-up" && (
        <label className="block">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
            Нэр
          </span>
          <div className="relative">
            <User
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("fullNamePlaceholder")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm font-semibold outline-none focus:border-[#00C896] focus:bg-white"
            />
          </div>
        </label>
      )}

      <label className="block">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
          Утасны дугаар
        </span>
        <div className="relative">
          <Phone
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="tel"
            required
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="99918122"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm font-semibold outline-none focus:border-[#00C896] focus:bg-white"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
          Нууц үг
        </span>
        <div className="relative">
          <Lock
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordPlaceholder")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm font-semibold outline-none focus:border-[#00C896] focus:bg-white"
          />
        </div>
      </label>

      {error && (
        <p className="text-sm font-semibold text-[#E31B23] bg-red-50 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E31B23] text-white font-bold py-3.5 hover:brightness-110 disabled:opacity-60"
      >
        {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
        {mode === "sign-up" ? "Бүртгүүлэх" : "Нэвтрэх"}
        {!isLoading && <ArrowRight size={16} />}
      </button>

      <p className="text-center text-sm text-slate-500 pt-1">
        {mode === "sign-up" ? (
          <>
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/sign-in"
              className="font-bold text-[#00C896] hover:underline"
            >
              {t("signIn")}
            </Link>
          </>
        ) : (
          <>
            {t("newMember")}{" "}
            <Link
              href="/sign-up"
              className="font-bold text-[#00C896] hover:underline"
            >
              {t("signUpButton")}
            </Link>
          </>
        )}
      </p>

      <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide pt-1">
        <ShieldCheck size={14} className="text-[#00C896]" />
        Утас + нууц үг
      </div>
    </form>
  );
}
