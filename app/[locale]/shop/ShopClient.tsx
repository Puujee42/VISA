"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowUpRight, ShoppingBag, Loader2, Info, QrCode } from "lucide-react";

const BRAND = {
  RED: "#E31B23",
  GREEN: "#00C896",
};

const T = {
  inStock: { en: "In Stock", mn: "Агуулахад байгаа", de: "Auf Lager" },
  outOfStock: { en: "Out of Stock", mn: "Дууссан", de: "Ausverkauft" },
  view: { en: "View", mn: "Үзэх", de: "Ansehen" },
  shopTitle: { en: "Our Shop", mn: "Дэлгүүр", de: "Unser Shop" },
  shopDesc: {
    en: "Discover our curated selection of premium products and merchandise.",
    mn: "Бидний санал болгож буй дээд зэрэглэлийн бүтээгдэхүүнүүд.",
    de: "Entdecken Sie unsere kuratierte Auswahl an Premium-Produkten und Fanartikeln.",
  },
  notFound: {
    en: "No items found",
    mn: "Бүтээгдэхүүн олдсонгүй",
    de: "Keine Artikel gefunden",
  },
  catAll: { en: "ALL", mn: "БҮГД", de: "ALLE" },
  catGeneral: { en: "GENERAL", mn: "ЕРӨНХИЙ", de: "ALLGEMEIN" },
} as const;

const formatCategory = (cat: string, locale: string) => {
  if (!cat || cat.toLowerCase() === "general") {
    return T.catGeneral[locale as keyof typeof T.catGeneral] || T.catGeneral.en;
  }
  if (cat.toLowerCase() === "all") {
    return T.catAll[locale as keyof typeof T.catAll] || T.catAll.en;
  }
  // Return the uppercase category name if it's custom.
  // Ideally, custom categories should also be mapped if they are predefined.
  return cat.toUpperCase();
};

interface LocalizedString {
  en?: string;
  mn?: string;
  de?: string;
  [key: string]: string | undefined;
}

interface ShopItem {
  _id: string;
  name: LocalizedString;
  description?: LocalizedString;
  category?: string;
  stock: number;
  image?: string;
  price: number;
}

const ProductCard = ({
  item,
  locale = "en",
  isDark,
}: {
  item: ShopItem;
  locale?: string;
  isDark: boolean;
}) => {
  const name = item.name?.[locale] || item.name?.en || "Unknown Item";
  const desc = item.description?.[locale] || item.description?.en || "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className={`relative group rounded-[2rem] overflow-hidden cursor-pointer h-full border transition-all duration-500 min-h-[450px] flex flex-col
        ${
          isDark
            ? "bg-slate-900 border-white/5 hover:border-white/10"
            : "bg-white border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl"
        }`}
    >
      {/* Image Container */}
      <div className="relative w-full h-64 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={item.image || "/placeholder.jpg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* category pill */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20 backdrop-blur-md bg-[#00C896]/90 shadow-md">
            {formatCategory(item.category || "general", locale)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative z-20">
        <div className="flex justify-between items-start mb-4">
          <h3
            className={`text-xl sm:text-2xl font-black tracking-tight line-clamp-2 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {name}
          </h3>
          <span
            className={`text-xl font-bold px-3 py-1 rounded-full whitespace-nowrap bg-slate-100 dark:bg-slate-800 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            ${item.price}
          </span>
        </div>

        <p
          className={`text-sm leading-relaxed mb-6 line-clamp-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          {desc}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div
            className={`text-xs font-bold uppercase tracking-wider ${item.stock > 0 ? "text-[#00C896]" : "text-red-500"}`}
          >
            {item.stock > 0
              ? T.inStock[locale as keyof typeof T.inStock] || T.inStock.en
              : T.outOfStock[locale as keyof typeof T.outOfStock] ||
                T.outOfStock.en}
          </div>

          <Link
            href={`/${locale}/shop/${item._id}`}
            className={`flex items-center gap-2 font-black uppercase tracking-widest text-[10px] hover:opacity-80 transition-opacity ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {T.view[locale as keyof typeof T.view] || T.view.en}
            <span className="p-1.5 rounded-full text-white shadow-md bg-[#E31B23]">
              <ArrowUpRight size={12} />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function ShopClient({
  items,
  locale,
}: {
  items: ShopItem[];
  locale: string;
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);
  const isDark = mounted && theme === "dark";

  const categories = [
    "all",
    ...Array.from(
      new Set(
        items
          .map((item) => item.category)
          .filter((c): c is string => Boolean(c)),
      ),
    ),
  ];
  const filteredItems = items.filter(
    (item) => filter === "all" || item.category === filter,
  );

  if (!mounted) return null;

  return (
    <div
      className={`relative px-6 overflow-hidden transition-colors duration-700`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-16">
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl sm:text-6xl font-black tracking-tighter leading-[0.9] ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {T.shopTitle[locale as keyof typeof T.shopTitle] ||
                T.shopTitle.en}
              <span style={{ color: BRAND.GREEN }}>.</span>
            </motion.h2>
            <p
              className={`text-sm tracking-wide font-medium max-w-xl ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              {T.shopDesc[locale as keyof typeof T.shopDesc] || T.shopDesc.en}
            </p>
          </div>

          {/* QPay Badge */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest w-fit
              ${
                isDark
                  ? "bg-slate-900 border-white/10 text-white"
                  : "bg-white border-slate-200 text-slate-700 shadow-sm"
              }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#E31B23] text-white flex items-center justify-center">
              <QrCode size={12} />
            </span>
            QPay accepted
          </motion.div>

          {/* Categories Filter */}
          <motion.div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
            {categories.map((cat: string) => {
              const isActive = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`
                    relative whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border
                    ${
                      isActive
                        ? "text-white border-transparent"
                        : isDark
                          ? "text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
                          : "text-slate-600 border-slate-200 hover:border-slate-300 bg-white"
                    }
                  `}
                  style={{
                    backgroundColor: isActive ? BRAND.GREEN : "transparent",
                  }}
                >
                  {formatCategory(cat, locale)}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Product Grid */}
        <div className="min-h-[500px]">
          {filteredItems.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <ProductCard
                    key={item._id}
                    item={item}
                    locale={locale}
                    isDark={isDark}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center py-32 rounded-[3rem] border-2 border-dashed ${isDark ? "border-white/10 bg-slate-900/50" : "border-slate-300 bg-slate-50/50"}`}
            >
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <ShoppingBag size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                {T.notFound[locale as keyof typeof T.notFound] || T.notFound.en}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
