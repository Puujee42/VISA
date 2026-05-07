import { getTranslations } from "next-intl/server";
import BelgiumClient from "./BelgiumClient";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "BelgiumPage.metadata" });

    const title = t("title");
    const description = t("description");

    return {
        title,
        description,
        alternates: generateAlternates(locale, "/aupair/belgium"),
        openGraph: generateOpenGraph({ title, description, locale, path: "/aupair/belgium" }),
        twitter: generateTwitter({ title, description }),
        keywords: t.has("keywords") ? t("keywords") : undefined,
    };
}

export default async function BelgiumPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "BelgiumPage" });

    return (
        <>
            <BreadcrumbJsonLd
                locale={locale}
                items={[
                    { name: "Home", href: "" },
                    { name: "Au Pair Program", href: "/aupair" },
                    { name: "Belgium", href: "/aupair/belgium" },
                ]}
            />
            <FAQJsonLd
                faqs={[
                    {
                        question: "Can I learn multiple languages as an Au Pair in Belgium?",
                        answer: "Yes! Belgium has three official languages: French, Dutch (Flemish), and German. Depending on your host family's region, you can learn and practice one or more of these languages daily.",
                    },
                    {
                        question: "What are the working hours for Au Pairs in Belgium?",
                        answer: "Au Pairs in Belgium typically work 20 hours per week helping with childcare and light household duties. You also receive time off for language courses and personal activities.",
                    },
                    {
                        question: "Why choose Belgium for an Au Pair program?",
                        answer: "Belgium is the heart of Europe and home to the EU capital Brussels. It offers a unique multicultural experience, world-famous chocolate and waffles, historic castles, and easy access to neighboring European countries.",
                    },
                ]}
            />
            <BelgiumClient />
        </>
    );
}
