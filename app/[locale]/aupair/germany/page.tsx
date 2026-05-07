import { getTranslations } from "next-intl/server";
import GermanyClient from "./GermanyClient";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "GermanyPage.metadata" });

    const title = t("title");
    const description = t("description");

    return {
        title,
        description,
        alternates: generateAlternates(locale, "/aupair/germany"),
        openGraph: generateOpenGraph({ title, description, locale, path: "/aupair/germany" }),
        twitter: generateTwitter({ title, description }),
        keywords: t.has("keywords") ? t("keywords") : undefined,
    };
}

export default async function GermanyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "GermanyPage" });

    return (
        <>
            <BreadcrumbJsonLd
                locale={locale}
                items={[
                    { name: "Home", href: "" },
                    { name: "Au Pair Program", href: "/aupair" },
                    { name: t("hero.highlight"), href: "/aupair/germany" },
                ]}
            />
            <FAQJsonLd
                faqs={[
                    {
                        question: "What is the Au Pair program in Germany?",
                        answer: "The Au Pair program in Germany is an international cultural exchange for young people aged 18-26. You live with a German host family, help with childcare, and attend language courses while experiencing German culture.",
                    },
                    {
                        question: "How much does an Au Pair earn in Germany?",
                        answer: "Au Pairs in Germany receive a monthly pocket money of €280, plus free accommodation, meals, health insurance, and a language course allowance of €50/month.",
                    },
                    {
                        question: "What are the requirements to become an Au Pair in Germany?",
                        answer: "Requirements include: age 18-26, unmarried, good health, no criminal record, basic German language skills (A1), and a genuine interest in German culture.",
                    },
                    {
                        question: "How long is the Au Pair program in Germany?",
                        answer: "The standard Au Pair program in Germany lasts 6 to 12 months, with the possibility of extension up to a maximum of 24 months.",
                    },
                ]}
            />
            <GermanyClient />
        </>
    );
}
