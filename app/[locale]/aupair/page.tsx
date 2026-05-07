import { getTranslations } from "next-intl/server";
import AuPairClient from "./AuPairClient";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "AuPair.metadata" });

    const title = t("title");
    const description = t("description");

    return {
        title,
        description,
        alternates: generateAlternates(locale, "/aupair"),
        openGraph: generateOpenGraph({ title, description, locale, path: "/aupair" }),
        twitter: generateTwitter({ title, description }),
        keywords: t.has("keywords") ? t("keywords") : undefined,
    };
}

export default async function AuPairPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <>
            <BreadcrumbJsonLd
                locale={locale}
                items={[
                    { name: "Home", href: "" },
                    { name: "Au Pair Program", href: "/aupair" },
                ]}
            />
            <AuPairClient />
        </>
    );
}
