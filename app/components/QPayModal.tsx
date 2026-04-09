"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Clock3, ExternalLink, X } from "lucide-react";

type PaymentStatus = "idle" | "waiting" | "paid" | "failed" | "expired";

type QPayDeepLink = {
  name?: string;
  description?: string;
  link: string;
  logo?: string;
};

type QPayModalProps = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  invoiceId: string;
  qrImage?: string; // usually base64 image from API
  qrText?: string; // fallback QR text / payload
  deepLinks?: QPayDeepLink[];
  locale?: "en" | "mn" | "de" | string;
  pollIntervalMs?: number;
  expiresInSeconds?: number;
  onSuccess?: () => void;
};

const T = {
  title: {
    en: "Pay with QPay",
    mn: "QPay-ээр төлөх",
    de: "Mit QPay bezahlen",
  },
  subtitle: {
    en: "Scan the QR or choose your banking app",
    mn: "QR кодоо уншуулж эсвэл банкны апп сонгоно уу",
    de: "QR scannen oder Banking-App auswählen",
  },
  waiting: {
    en: "Waiting for payment confirmation...",
    mn: "Төлбөр баталгаажихыг хүлээж байна...",
    de: "Warte auf Zahlungsbestätigung...",
  },
  paid: {
    en: "Payment successful!",
    mn: "Төлбөр амжилттай!",
    de: "Zahlung erfolgreich!",
  },
  failed: {
    en: "Payment failed",
    mn: "Төлбөр амжилтгүй",
    de: "Zahlung fehlgeschlagen",
  },
  expired: {
    en: "Invoice expired",
    mn: "Нэхэмжлэл хугацаа дууссан",
    de: "Rechnung abgelaufen",
  },
  close: {
    en: "Close",
    mn: "Хаах",
    de: "Schließen",
  },
  checking: {
    en: "Checking payment...",
    mn: "Төлбөр шалгаж байна...",
    de: "Zahlung wird geprüft...",
  },
  copy: {
    en: "Copy QR text",
    mn: "QR текст хуулах",
    de: "QR-Text kopieren",
  },
  copied: {
    en: "Copied",
    mn: "Хууллаа",
    de: "Kopiert",
  },
  openApp: {
    en: "Open",
    mn: "Нээх",
    de: "Öffnen",
  },
  remaining: {
    en: "Time remaining",
    mn: "Үлдсэн хугацаа",
    de: "Verbleibende Zeit",
  },
};

function tr(locale: string | undefined, key: keyof typeof T) {
  const lang = locale && ["en", "mn", "de"].includes(locale) ? (locale as "en" | "mn" | "de") : "en";
  return T[key][lang];
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.max(seconds % 60, 0)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function normalizeQrImage(src?: string) {
  if (!src) return "";
  if (src.startsWith("data:image")) return src;
  const trimmed = src.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `data:image/png;base64,${trimmed}`;
}

export default function QPayModal({
  open,
  onClose,
  orderId,
  invoiceId,
  qrImage,
  qrText,
  deepLinks = [],
  locale = "en",
  pollIntervalMs = 3000,
  expiresInSeconds = 1800,
  onSuccess,
}: QPayModalProps) {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(expiresInSeconds);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);

  const qrSrc = useMemo(() => normalizeQrImage(qrImage), [qrImage]);
  const links = useMemo(() => deepLinks.filter((l) => !!l?.link), [deepLinks]);

  useEffect(() => {
    if (!open) return;
    setStatus("waiting");
    setSecondsLeft(expiresInSeconds);
    setCopied(false);
  }, [open, expiresInSeconds]);

  useEffect(() => {
    if (!open) return;

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setStatus((s) => (s === "waiting" ? "expired" : s));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open || status !== "waiting") return;

    const checkPayment = async () => {
      if (!orderId || !invoiceId) return;
      try {
        setLoadingCheck(true);
        const res = await fetch(
          `/api/payments/qpay/check-payment?orderId=${encodeURIComponent(orderId)}&invoiceId=${encodeURIComponent(invoiceId)}`,
          { method: "GET", cache: "no-store" }
        );

        if (!res.ok) return;
        const data = await res.json();
        if (data?.paid === true) {
          setStatus("paid");
          if (onSuccess) onSuccess();
        } else if (data?.status === "failed") {
          setStatus("failed");
        }
      } catch {
        // keep waiting state if temporary network error
      } finally {
        setLoadingCheck(false);
      }
    };

    // immediate first check
    checkPayment();

    pollRef.current = window.setInterval(() => {
      checkPayment();
    }, pollIntervalMs);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [open, status, orderId, invoiceId, pollIntervalMs, onSuccess]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const handleCopy = async () => {
    if (!qrText) return;
    try {
      await navigator.clipboard.writeText(qrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="qpay-modal-overlay"
        className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          key="qpay-modal-content"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden"
        >
          <div className="p-5 sm:p-7 border-b border-slate-200 dark:border-white/10 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{tr(locale, "title")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{tr(locale, "subtitle")}</p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:opacity-80 transition"
              aria-label={tr(locale, "close")}
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 sm:p-7 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/40">
              <div className="aspect-square w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                {qrSrc ? (
                  <Image src={qrSrc} alt="QPay QR" width={320} height={320} className="w-full h-full object-contain" />
                ) : qrText ? (
                  <div className="text-xs text-slate-600 dark:text-slate-300 p-4 break-all">{qrText}</div>
                ) : (
                  <div className="text-sm text-slate-500">{tr(locale, "checking")}</div>
                )}
              </div>

              {qrText && (
                <button
                  onClick={handleCopy}
                  className="mt-4 w-full rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:opacity-85 transition"
                >
                  {copied ? tr(locale, "copied") : tr(locale, "copy")}
                </button>
              )}
            </div>

            <div className="flex flex-col">
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/40 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                    {tr(locale, "remaining")}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                    <Clock3 size={16} /> {formatTime(secondsLeft)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 sm:p-5 flex items-center gap-3 bg-white dark:bg-slate-900 mb-4">
                {status === "waiting" && <Loader2 className="animate-spin text-blue-500" size={20} />}
                {status === "paid" && <CheckCircle2 className="text-emerald-500" size={20} />}
                {status === "failed" && <XCircle className="text-red-500" size={20} />}
                {status === "expired" && <Clock3 className="text-amber-500" size={20} />}

                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {status === "waiting" && tr(locale, "waiting")}
                  {status === "paid" && tr(locale, "paid")}
                  {status === "failed" && tr(locale, "failed")}
                  {status === "expired" && tr(locale, "expired")}
                </div>
              </div>

              {loadingCheck && status === "waiting" && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">{tr(locale, "checking")}</div>
              )}

              {links.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/40">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-3">Apps</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {links.map((bank, i) => (
                      <a
                        key={`${bank.link}-${i}`}
                        href={bank.link}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2.5 hover:border-emerald-400 transition"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          {bank.logo ? (
                            <Image
                              src={bank.logo}
                              alt={bank.name || "Bank"}
                              width={20}
                              height={20}
                              className="rounded-sm object-contain"
                            />
                          ) : (
                            <span className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20" />
                          )}
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {bank.name || bank.description || "Bank app"}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          {tr(locale, "openApp")} <ExternalLink size={12} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="mt-4 rounded-full px-5 py-3 text-xs font-black uppercase tracking-widest bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition"
              >
                {tr(locale, "close")}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
