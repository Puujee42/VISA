import { getTranslations } from "next-intl/server";
import OpportunitiesClient from "./OpportunitiesClient";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;

    const titleMap: Record<string, string> = {
        en: "Opportunities — Scholarships, Internships & Volunteering",
        mn: "Боломжууд — Тэтгэлэг, Дадлага & Сайн дурын ажил",
        de: "Möglichkeiten — Stipendien, Praktika & Freiwilligenarbeit",
    };
    const descMap: Record<string, string> = {
        en: "Explore scholarships, internships, and volunteering opportunities in Europe for Mongolian youth. Find your path to international experience.",
        mn: "Монгол залуучуудад зориулсан Европ дахь тэтгэлэг, дадлага, сайн дурын ажлын боломжуудыг судлаарай.",
        de: "Entdecken Sie Stipendien, Praktika und Freiwilligenarbeit in Europa für mongolische Jugendliche. Finden Sie Ihren Weg zur internationalen Erfahrung.",
    };

    const title = titleMap[locale] || titleMap.en;
    const description = descMap[locale] || descMap.en;

    return {
        title,
        description,
        alternates: generateAlternates(locale, "/opportunities"),
        openGraph: generateOpenGraph({ title, description, locale, path: "/opportunities" }),
        twitter: generateTwitter({ title, description }),
    };
}

export default async function OpportunitiesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <>
            <BreadcrumbJsonLd
                locale={locale}
                items={[
                    { name: "Home", href: "" },
                    { name: "Opportunities", href: "/opportunities" },
                ]}
            />
            <OpportunitiesClient />
        </>
    );
}