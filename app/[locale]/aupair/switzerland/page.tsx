import { getTranslations } from "next-intl/server";
import SwitzerlandClient from "./SwitzerlandClient";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "SwitzerlandPage.metadata" });

    const title = t("title");
    const description = t("description");

    return {
        title,
        description,
        alternates: generateAlternates(locale, "/aupair/switzerland"),
        openGraph: generateOpenGraph({ title, description, locale, path: "/aupair/switzerland" }),
        twitter: generateTwitter({ title, description }),
        keywords: t.has("keywords") ? t("keywords") : undefined,
    };
}

export default async function SwitzerlandPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "SwitzerlandPage" });

    return (
        <>
            <BreadcrumbJsonLd
                locale={locale}
                items={[
                    { name: "Home", href: "" },
                    { name: "Au Pair Program", href: "/aupair" },
                    { name: t("hero.highlight"), href: "/aupair/switzerland" },
                ]}
            />
            <FAQJsonLd
                faqs={[
                    {
                        question: "How much does an Au Pair earn in Switzerland?",
                        answer: "Au Pairs in Switzerland receive one of the highest salaries globally at 990 CHF per month, plus free accommodation, meals, health insurance, and 120 hours of free language courses.",
                    },
                    {
                        question: "How many languages can I learn in Switzerland?",
                        answer: "Switzerland has 4 official languages: German, French, Italian, and Romansh. Depending on the region of your host family, you can learn and practice one or more of these languages.",
                    },
                    {
                        question: "What are the benefits of being an Au Pair in Switzerland?",
                        answer: "Switzerland offers the highest quality of life in the world, stunning Alpine nature, 4 weeks paid vacation, 990 CHF monthly salary, free language courses, and one of the safest living environments globally.",
                    },
                    {
                        question: "What are the Au Pair working hours in Switzerland?",
                        answer: "Au Pairs in Switzerland work a maximum of 30 hours per week, including childcare and light household duties. You get at least one full day off per week and 4 weeks of paid vacation per year.",
                    },
                ]}
            />
            <SwitzerlandClient />
        </>
    );
}
