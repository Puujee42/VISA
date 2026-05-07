import { getTranslations } from "next-intl/server";
import NewsClient from "./NewsClient";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "NewsPage.metadata" });

    const title = t("title");
    const description = t("description");

    return {
        title,
        description,
        alternates: generateAlternates(locale, "/news"),
        openGraph: generateOpenGraph({ title, description, locale, path: "/news" }),
        twitter: generateTwitter({ title, description }),
    };
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <>
            <BreadcrumbJsonLd
                locale={locale}
                items={[
                    { name: "Home", href: "" },
                    { name: "News & Blog", href: "/news" },
                ]}
            />
            <NewsClient />
        </>
    );
}
