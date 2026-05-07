import { getTranslations } from "next-intl/server";
import ContactClient from "./ContactClient";
import { Metadata } from "next";
import { generateAlternates, generateOpenGraph, generateTwitter } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/app/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "ContactPage.metadata" });

    const title = t("title");
    const description = t("description");

    return {
        title,
        description,
        alternates: generateAlternates(locale, "/contact"),
        openGraph: generateOpenGraph({ title, description, locale, path: "/contact" }),
        twitter: generateTwitter({ title, description }),
    };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <>
            <BreadcrumbJsonLd
                locale={locale}
                items={[
                    { name: "Home", href: "" },
                    { name: "Contact", href: "/contact" },
                ]}
            />
            <ContactClient />
        </>
    );
}
