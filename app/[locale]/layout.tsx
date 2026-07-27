import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "../components/Navbar";
import dynamic from "next/dynamic";
import MotionProvider from "../components/MotionProvider";
import PushNotificationManager from "../components/PushNotificationManager";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { OrganizationJsonLd } from "../components/JsonLd";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
  themeColor: "#ffffff",
};

const Footer = dynamic(() => import("../components/Footer"), {
  ssr: true,
  loading: () => null,
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mongolianaupair.com"),
  title: {
    default: "Mongolian Au Pair — Gateway to Europe | Cultural Exchange Program",
    template: "%s | Mongolian Au Pair",
  },
  description:
    "Mongolia's leading au pair agency since 2005. Connect with host families in Germany, Austria, Switzerland, Belgium & France. Learn languages, experience European culture, and build your future.",
  keywords: [
    "au pair Mongolia",
    "Mongolian au pair",
    "au pair Germany",
    "au pair Austria",
    "au pair Switzerland",
    "au pair Belgium",
    "au pair France",
    "cultural exchange Mongolia",
    "au pair agency Mongolia",
    "au pair program Europe",
    "Монгол au pair",
    "au pair Герман",
    "au pair Европ",
    "Au-Pair Mongolei",
    "IAPA member Mongolia",
    "host family Europe",
    "language learning abroad",
    "work in Europe Mongolia",
  ],
  applicationName: "Mongolian Au Pair",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AuPair",
  },
  formatDetection: {
    telephone: true,
    email: true,
  },
  category: "Education",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Mongolian Au Pair",
    locale: "en_US",
    alternateLocale: ["mn_MN", "de_DE"],
    images: [
      {
        url: "/image.png",
        width: 512,
        height: 512,
        alt: "Mongolian Au Pair — Gateway to Europe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@MongolianAuPair",
    images: ["/image.png"],
  },
  icons: {
    icon: "/image.png",
    apple: "/image.png",
  },
  verification: {
    // Add your Google Search Console verification code here when ready
    // google: "your-verification-code",
  },
};

const locales = ['en', 'mn', 'de'];

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <OrganizationJsonLd />
      </head>
      <body className={`${inter.variable} font-sans app-page-shell`}>
        <NextIntlClientProvider messages={messages}>
          <MotionProvider>
            <PushNotificationManager />
            <Navbar />
            <main className="min-h-[100dvh] pt-[calc(var(--app-header-height)+env(safe-area-inset-top,0px))] pb-[calc(var(--app-bottom-nav-height)+env(safe-area-inset-bottom,0px)+8px)] lg:pt-0 lg:pb-0">
              {children}
            </main>
            <div className="hidden lg:block">
              <Footer />
            </div>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}