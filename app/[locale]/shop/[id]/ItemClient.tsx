"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import QPayModal from "@/app/components/QPayModal";

const BRAND = {
  RED: "#E31B23",
  GREEN: "#00C896",
};

const T = {
  back: { en: "Back to Shop", mn: "Буцах", de: "Zurück zum Shop" },
  details: {
    en: "Product Details",
    mn: "Бүтээгдэхүүний тухай",
    de: "Produktdetails",
  },
  inStockPrefix: {
    en: "in stock - Ready to ship",
    mn: "Агуулахад",
    de: "auf Lager - Versandfertig",
  },
  inStockSuffix: { en: "", mn: "ширхэг байна", de: "" },
  outOfStock: { en: "Out of stock", mn: "Дууссан", de: "Ausverkauft" },
  order: {
    en: "Order / Purchase",
    mn: "Сагсанд нэмэх эсвэл захиалах",
    de: "Bestellen / Kaufen",
  },
  catGeneral: { en: "GENERAL", mn: "ЕРӨНХИЙ", de: "ALLGEMEIN" },

  // QPay
  creatingInvoice: {
    en: "Creating invoice...",
    mn: "Нэхэмжлэл үүсгэж байна...",
    de: "Rechnung wird erstellt...",
  },
  paymentError: {
    en: "Payment initialization failed",
    mn: "Төлбөр эхлүүлэхэд алдаа гарлаа",
    de: "Zahlung konnte nicht gestartet werden",
  },
  paymentSuccess: {
    en: "Payment successful!",
    mn: "Төлбөр амжилттай!",
    de: "Zahlung erfolgreich!",
  },
} as const;

const formatCategory = (cat: string, locale: string) => {
  if (!cat || cat.toLowerCase() === "general") {
    return T.catGeneral[locale as keyof typeof T.catGeneral] || T.catGeneral.en;
  }
  return cat.toUpperCase();
};

type QPayLink = {
  name?: string;
  description?: string;
  link: string;
  logo?: string;
};

type InvoiceResponse = {
  success: boolean;
  orderId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  qrText?: string;
  qrImage?: string;
  urls?: QPayLink[];
  expiresAt?: string;
  error?: string;
};

export default function ItemClient({
  item,
  locale = "en",
}: {
  item: any;
  locale: string;
}) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  const [stock, setStock] = useState<number>(Number(item?.stock || 0));
  const [buying, setBuying] = useState(false);
  const [paymentError, setPaymentError] = useState<string>("");

  const [qpayOpen, setQpayOpen] = useState(false);
  const [qpayOrderId, setQpayOrderId] = useState("");
  const [qpayInvoiceId, setQpayInvoiceId] = useState("");
  const [qpayQrImage, setQpayQrImage] = useState("");
  const [qpayQrText, setQpayQrText] = useState("");
  const [qpayLinks, setQpayLinks] = useState<QPayLink[]>([]);
  const [expiresInSeconds, setExpiresInSeconds] = useState(1800);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && theme === "dark";

  const name = item.name?.[locale] || item.name?.en || "Unknown Item";
  const desc = item.description?.[locale] || item.description?.en || "";

  const inStockText =
    locale === "mn"
      ? `${T.inStockPrefix.mn} ${stock} ${T.inStockSuffix.mn}`
      : `${stock} ${T.inStockPrefix[locale as keyof typeof T.inStockPrefix] || T.inStockPrefix.en}`;

  const orderLabel = T.order[locale as keyof typeof T.order] || T.order.en;

  const parseExpiresSeconds = (expiresAt?: string) => {
    if (!expiresAt) return 1800;
    const end = new Date(expiresAt).getTime();
    const now = Date.now();
    const diff = Math.floor((end - now) / 1000);
    return diff > 0 ? diff : 1800;
  };

  const handleCreateInvoice = async () => {
    if (stock <= 0 || buying) return;

    setBuying(true);
    setPaymentError("");

    try {
      const res = await fetch("/api/payments/qpay/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item._id, locale, quantity: 1 }),
      });

      const data: InvoiceResponse = await res.json();

      if (!res.ok || !data?.success || !data?.orderId || !data?.invoiceId) {
        throw new Error(
          data?.error ||
            T.paymentError[locale as keyof typeof T.paymentError] ||
            T.paymentError.en,
        );
      }

      setQpayOrderId(data.orderId);
      setQpayInvoiceId(data.invoiceId);
      setQpayQrImage(data.qrImage || "");
      setQpayQrText(data.qrText || "");
      setQpayLinks(Array.isArray(data.urls) ? data.urls : []);
      setExpiresInSeconds(parseExpiresSeconds(data.expiresAt));

      setQpayOpen(true);
    } catch (error: any) {
      setPaymentError(
        error?.message ||
          T.paymentError[locale as keyof typeof T.paymentError] ||
          T.paymentError.en,
      );
    } finally {
      setBuying(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Optimistic stock update (backend also decrements stock safely)
    setStock((prev) => (prev > 0 ? prev - 1 : 0));
    setPaymentError("");
  };

  if (!mounted) return null;

  return (
    <>
      <div className="max-w-7xl mx-auto px-6">
        {/* Back button */}
        <Link
          href={`/${locale}/shop`}
          className={`inline-flex items-center gap-2 mb-10 text-xs font-bold uppercase tracking-widest transition-colors ${
            isDark
              ? "text-slate-400 hover:text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ArrowLeft size={16} />
          {T.back[locale as keyof typeof T.back] || T.back.en}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Image */}
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square overflow-hidden rounded-[2rem] sm:rounded-[3rem] border border-slate-100 dark:border-white/5 bg-slate-100 dark:bg-slate-900"
          >
            <Image
              src={item.image || "/placeholder.jpg"}
              alt={name}
              fill
              className="object-cover"
              priority
            />
          </m.div>

          {/* Right: Product Info */}
          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            {/* Category */}
            <div className="mb-4">
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white backdrop-blur-md bg-[#00C896] shadow-sm">
                {formatCategory(item.category || "general", locale)}
              </span>
            </div>

            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9] mb-6 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {name}
              <span style={{ color: BRAND.GREEN }}>.</span>
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <span
                className={`text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}
              >
                ${item.price}
              </span>
            </div>

            <div className="w-full h-[1px] bg-slate-200 dark:bg-white/10 mb-8" />

            {/* Description */}
            <div className="mb-10">
              <h3
                className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {T.details[locale as keyof typeof T.details] || T.details.en}
              </h3>
              <p
                className={`text-base leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                {desc}
              </p>
            </div>

            <div className="w-full h-[1px] bg-slate-200 dark:bg-white/10 mb-8" />

            {/* Order / Status */}
            <div className="space-y-6">
              <div
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${stock > 0 ? "text-[#00C896]" : "text-[#E31B23]"}`}
              >
                {stock > 0 ? <Check size={18} /> : <AlertCircle size={18} />}
                {stock > 0
                  ? inStockText
                  : T.outOfStock[locale as keyof typeof T.outOfStock] ||
                    T.outOfStock.en}
              </div>

              {paymentError && (
                <div className="text-xs font-bold text-[#E31B23] bg-rose-50 border border-rose-200 px-4 py-3 rounded-2xl">
                  {paymentError}
                </div>
              )}

              <button
                disabled={stock <= 0 || buying}
                onClick={handleCreateInvoice}
                className={`w-full relative flex items-center justify-center gap-3 py-4 sm:py-5 px-8 rounded-full text-sm font-black uppercase tracking-widest text-white transition-all overflow-hidden ${
                  stock <= 0 || buying
                    ? "opacity-50 cursor-not-allowed grayscale"
                    : "hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl"
                }`}
                style={{ backgroundColor: BRAND.RED }}
              >
                {buying ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {T.creatingInvoice[
                      locale as keyof typeof T.creatingInvoice
                    ] || T.creatingInvoice.en}
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    {orderLabel}
                  </>
                )}
              </button>
            </div>
          </m.div>
        </div>
      </div>

      {/* QPay Modal */}
      <QPayModal
        open={qpayOpen}
        onClose={() => setQpayOpen(false)}
        orderId={qpayOrderId}
        invoiceId={qpayInvoiceId}
        qrImage={qpayQrImage}
        qrText={qpayQrText}
        deepLinks={qpayLinks}
        locale={locale}
        expiresInSeconds={expiresInSeconds}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
