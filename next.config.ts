import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  compress: true,
  trailingSlash: false,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "1001traveldestinations.wordpress.com",
      },
      {
        protocol: "https",
        hostname: "www.worldatlas.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "s3.qpay.mn",
      },
      {
        protocol: "https",
        hostname: "cdn.qpay.mn",
      },
      {
        protocol: "https",
        hostname: "**.qpay.mn",
      },
    ],
  },
  serverExternalPackages: [
    "nodemailer",
    "cloudinary",
    "livekit-server-sdk",
  ],
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "react-icons",
      "react-icons/fa",
      "react-countup",
      "react-type-animation",
    ],
  },
  async headers() {
    return [
      // Security headers on every response
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Next.js owns /_next/static cache headers — do not override (causes stale chunk errors in Turbopack)
      // Public news feed: 60 s fresh, 5 min stale-while-revalidate
      {
        source: '/api/news',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' }],
      },
      // Public events: same cadence
      {
        source: '/api/events',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' }],
      },
      // Opportunities change rarely – 5 min fresh, 10 min stale
      {
        source: '/api/opportunities',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' }],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect old Cyrillic scholarship page to homepage (301 permanent)
      {
        source: '/:locale/mongolian-au-pair-2024-тэтгэлгийн-эзэн-тодорлоо',
        destination: '/:locale',
        permanent: true,
      },
      {
        source: '/mongolian-au-pair-2024-тэтгэлгийн-эзэн-тодорлоо',
        destination: '/en',
        permanent: true,
      },
      // URL-encoded version of the same Cyrillic path
      {
        source: '/:locale/mongolian-au-pair-2024-%D1%82%D1%8D%D1%82%D0%B3%D1%8D%D0%BB%D0%B3%D0%B8%D0%B9%D0%BD-%D1%8D%D0%B7%D1%8D%D0%BD-%D1%82%D0%BE%D0%B4%D0%BE%D1%80%D0%BB%D0%BE%D0%BE',
        destination: '/:locale',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/rust/:path*",
        destination: "http://localhost:8080/:path*", // Proxy to Rust service
      },
    ];
  },
};

export default withNextIntl(nextConfig);
