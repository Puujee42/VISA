import { connectToDB } from "@/lib/db";
import ShoppingItem from "@/lib/models/ShoppingItem";
import ShopClient from "./ShopClient";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  const titleMap: Record<string, string> = {
    en: "Shop — Mongolian Au Pair Store",
    mn: "Дэлгүүр — Mongolian Au Pair",
    de: "Shop — Mongolian Au Pair Laden",
  };
  const descMap: Record<string, string> = {
    en: "Discover premium Mongolian products, cultural items, and exclusive Au Pair merchandise. Support your journey to Europe.",
    mn: "Монголын Au Pair дэлгүүрээс бүтээгдэхүүн, соёлын бараа, онцгой бэлэг дурсгалын зүйлс худалдан аваарай.",
    de: "Entdecken Sie Premium-Produkte, kulturelle Artikel und exklusive Au-Pair-Waren. Unterstützen Sie Ihre Reise nach Europa.",
  };

  const title = titleMap[locale] || titleMap.en;
  const description = descMap[locale] || descMap.en;

  return {
    title,
    description,
    alternates: generateAlternates(locale, "/shop"),
    openGraph: generateOpenGraph({ title, description, locale, path: "/shop" }),
    twitter: generateTwitter({ title, description }),
  };
}

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  await connectToDB();
  const res = await ShoppingItem.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  const items = res.map((item: any) => ({
    ...item,
    _id: item._id.toString(),
    createdAt: item.createdAt?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  }));

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "Home", href: "" },
          { name: "Shop", href: "/shop" },
        ]}
      />
      <main className="min-h-screen pt-24 pb-12">
        <ShopClient items={items} locale={locale} />
      </main>
    </>
  );
}
