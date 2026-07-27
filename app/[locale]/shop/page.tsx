import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { toApiList } from "@/lib/supabase/mappers";
import { withSupabaseTimeout } from "@/lib/supabase/timeout";
import ShopClient from "./ShopClient";
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

  let data: unknown[] | null = null;
  try {
    const supabase = getSupabaseAdmin();
    const result = await withSupabaseTimeout(
      supabase
        .from("shopping_items")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    );
    if (result.error) {
      console.error("Shop page fetch error:", result.error);
    } else {
      data = result.data;
    }
  } catch (error) {
    console.error("Shop page fetch error:", error);
  }

  const items = toApiList(data).map((item) => ({
    ...item,
    createdAt: item.createdAt ? String(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
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
