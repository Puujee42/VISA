/**
 * JSON-LD Structured Data Components for SEO
 * Generates schema.org markup for better search engine understanding
 */

// --- Organization Schema (used on all pages via layout) ---
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mongolian Au Pair",
    alternateName: "Mongolian Au Pair Agency",
    url: "https://mongolianaupair.com",
    logo: "https://mongolianaupair.com/image.png",
    description:
      "Mongolia's leading au pair agency connecting Mongolian youth with host families in Germany, Austria, Switzerland, Belgium, and France since 2005.",
    foundingDate: "2005",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sukhbaatar street-Baga Toiruu, Tsetsee Gun office, 300A#",
      addressLocality: "Ulaanbaatar",
      addressCountry: "MN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+976-7711-6906",
      contactType: "customer service",
      email: "info@mongolianaupair.com",
      availableLanguage: ["English", "Mongolian", "German"],
    },
    sameAs: [
      "https://www.facebook.com/MongolianAuPair",
      "https://www.instagram.com/mongolianaupair",
    ],
    memberOf: {
      "@type": "Organization",
      name: "IAPA - International Au Pair Association",
      url: "https://www.iapa.org",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// --- WebSite Schema (homepage only) ---
export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mongolian Au Pair",
    url: "https://mongolianaupair.com",
    inLanguage: ["en", "mn", "de"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://mongolianaupair.com/en/news?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// --- BreadcrumbList Schema ---
interface BreadcrumbItem {
  name: string;
  href: string;
}

export function BreadcrumbJsonLd({
  items,
  locale,
}: {
  items: BreadcrumbItem[];
  locale: string;
}) {
  const baseUrl = "https://mongolianaupair.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}/${locale}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// --- FAQPage Schema (for au pair country pages) ---
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// --- EducationalOrganization Schema (for about page) ---
export function EducationalOrgJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Mongolian Au Pair",
    url: "https://mongolianaupair.com",
    logo: "https://mongolianaupair.com/image.png",
    description:
      "Cultural exchange and language education program connecting Mongolian youth with European host families.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ulaanbaatar",
      addressCountry: "MN",
    },
    areaServed: [
      { "@type": "Country", name: "Germany" },
      { "@type": "Country", name: "Austria" },
      { "@type": "Country", name: "Switzerland" },
      { "@type": "Country", name: "Belgium" },
      { "@type": "Country", name: "France" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
