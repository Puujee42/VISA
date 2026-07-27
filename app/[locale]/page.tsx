import HomePageContent from "@/app/components/HomePageContent";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { WebSiteJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage.metadata" });

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    alternates: generateAlternates(locale),
    openGraph: generateOpenGraph({ title, description, locale }),
    twitter: generateTwitter({ title, description }),
    keywords: t.has("keywords") ? t("keywords") : undefined,
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  await params;

  return (
    <>
      <WebSiteJsonLd />
      <HomePageContent />
    </>
  );
}
