import { getTranslations } from "next-intl/server";
import AboutClient from "./AboutClient";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd, EducationalOrgJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "About.metadata" });

    const title = t("title");
    const description = t("description");

    return {
        title,
        description,
        alternates: generateAlternates(locale, "/about"),
        openGraph: generateOpenGraph({ title, description, locale, path: "/about" }),
        twitter: generateTwitter({ title, description }),
    };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <>
            <BreadcrumbJsonLd
                locale={locale}
                items={[
                    { name: "Home", href: "" },
                    { name: "About Us", href: "/about" },
                ]}
            />
            <EducationalOrgJsonLd />
            <AboutClient />
        </>
    );
}
