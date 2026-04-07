import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "../components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import SmoothScroll from "../components/SmoothScroll";
import dynamic from "next/dynamic";
import MotionProvider from "../components/MotionProvider";
import PushNotificationManager from "../components/PushNotificationManager";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const Footer = dynamic(() => import("../components/Footer"));

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Aupair Mongolia",
  description: "Small Actions, Big Differences",
  icons: {
    icon: "/image.png",
    apple: "/image.png",
  }
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
    <ClerkProvider>
      <html lang={locale} suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://careful-beetle-54.clerk.accounts.dev" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://grainy-gradients.vercel.app" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://careful-beetle-54.clerk.accounts.dev" />
          <link rel="dns-prefetch" href="https://grainy-gradients.vercel.app" />
          <link rel="dns-prefetch" href="https://images.unsplash.com" />
        </head>
        <body className={`${inter.variable} font-sans`}>
          <NextIntlClientProvider messages={messages}>
            <MotionProvider>
              <SmoothScroll />
              <PushNotificationManager />
              <Navbar />
              <main className="min-h-[100dvh] pb-24 lg:pb-0">
                {children}
              </main>
              <Footer />
            </MotionProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}