/**
 * SEO Helper utilities for generating consistent metadata across pages
 */

const BASE_URL = "https://mongolianaupair.com";
const SITE_NAME = "Mongolian Au Pair";
const DEFAULT_OG_IMAGE = `${BASE_URL}/image.png`;

/**
 * Generate hreflang alternates for all 3 locales
 */
export function generateAlternates(locale: string, path: string = "") {
  return {
    canonical: `${BASE_URL}/${locale}${path}`,
    languages: {
      en: `${BASE_URL}/en${path}`,
      mn: `${BASE_URL}/mn${path}`,
      de: `${BASE_URL}/de${path}`,
      "x-default": `${BASE_URL}/en${path}`,
    },
  };
}

/**
 * Generate Open Graph metadata
 */
export function generateOpenGraph({
  title,
  description,
  locale,
  path = "",
  type = "website",
  images,
}: {
  title: string;
  description: string;
  locale: string;
  path?: string;
  type?: "website" | "article";
  images?: string[];
}) {
  const ogLocaleMap: Record<string, string> = {
    en: "en_US",
    mn: "mn_MN",
    de: "de_DE",
  };

  return {
    title,
    description,
    url: `${BASE_URL}/${locale}${path}`,
    siteName: SITE_NAME,
    locale: ogLocaleMap[locale] || "en_US",
    alternateLocale: Object.entries(ogLocaleMap)
      .filter(([key]) => key !== locale)
      .map(([, val]) => val),
    type,
    images: images || [
      {
        url: DEFAULT_OG_IMAGE,
        width: 512,
        height: 512,
        alt: "Mongolian Au Pair — Gateway to Europe",
      },
    ],
  };
}

/**
 * Generate Twitter Card metadata
 */
export function generateTwitter({
  title,
  description,
  images,
}: {
  title: string;
  description: string;
  images?: string[];
}) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: images || [DEFAULT_OG_IMAGE],
    site: "@MongolianAuPair",
  };
}

export { BASE_URL, SITE_NAME, DEFAULT_OG_IMAGE };
