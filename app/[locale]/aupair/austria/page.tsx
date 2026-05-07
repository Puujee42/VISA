import { getTranslations } from "next-intl/server";
import AustriaClient from "./AustriaClient";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "AustriaPage.metadata" });

    const title = t("title");
    const description = t("description");

    return {
        title,
        description,
        alternates: generateAlternates(locale, "/aupair/austria"),
        openGraph: generateOpenGraph({ title, description, locale, path: "/aupair/austria" }),
        twitter: generateTwitter({ title, description }),
        keywords: t.has("keywords") ? t("keywords") : undefined,
    };
}

export default async function AustriaPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "AustriaPage" });

    return (
        <>
            <BreadcrumbJsonLd
                locale={locale}
                items={[
                    { name: "Home", href: "" },
                    { name: "Au Pair Program", href: "/aupair" },
                    { name: t("hero.highlight"), href: "/aupair/austria" },
                ]}
            />
            <FAQJsonLd
                faqs={[
                    {
                        question: "What is the Au Pair program in Austria?",
                        answer: "The Au Pair program in Austria allows young people aged 18-27 to live with an Austrian host family, learn German, and experience the rich cultural heritage of the country including its famous Alps and classical music tradition.",
                    },
                    {
                        question: "What are the requirements for Au Pair in Austria?",
                        answer: "Requirements include: age 18-27, unmarried, good health, no criminal record, and basic German language knowledge. You should also have experience with childcare.",
                    },
                    {
                        question: "What does an Au Pair do in Austria?",
                        answer: "Au Pairs in Austria help with childcare (playing, feeding, school runs, homework help) and light housework. Working hours are typically 20-25 hours per week.",
                    },
                ]}
            />
            <AustriaClient />
        </>
    );
}
