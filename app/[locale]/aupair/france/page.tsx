import { getTranslations } from "next-intl/server";
import FranceClient from "./FranceClient";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FrancePage.metadata" });

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    alternates: generateAlternates(locale, "/aupair/france"),
    openGraph: generateOpenGraph({ title, description, locale, path: "/aupair/france" }),
    twitter: generateTwitter({ title, description }),
    keywords: t.has("keywords") ? t("keywords") : undefined,
  };
}

export default async function FrancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FrancePage" });

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "Home", href: "" },
          { name: "Au Pair Program", href: "/aupair" },
          { name: t("hero.highlight"), href: "/aupair/france" },
        ]}
      />
      <FAQJsonLd
        faqs={[
          {
            question: "How much does an Au Pair earn in France?",
            answer: "Au Pairs in France receive a monthly pocket money of approximately €350, plus free accommodation, meals, and access to language courses. The host family also covers public transportation costs.",
          },
          {
            question: "What language level do I need for Au Pair in France?",
            answer: "Basic French (A1-A2 level) is recommended. You'll improve rapidly through daily immersion with your host family and formal language courses.",
          },
          {
            question: "What is daily life like for an Au Pair in France?",
            answer: "Au Pairs in France typically work 25-30 hours per week, helping with childcare and light housework. You'll have free time to attend language classes, explore French culture, visit historic cities, and enjoy world-famous French cuisine.",
          },
        ]}
      />
      <FranceClient />
    </>
  );
}
