import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mongolianaupair.com";
  const locales = ["en", "mn", "de"];
  const lastModified = new Date();

  // Define all public routes with their SEO priority and change frequency
  const routes: {
    path: string;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority: number;
  }[] = [
    { path: "", changeFrequency: "weekly", priority: 1.0 },
    { path: "/aupair", changeFrequency: "weekly", priority: 0.9 },
    { path: "/aupair/germany", changeFrequency: "monthly", priority: 0.9 },
    { path: "/aupair/austria", changeFrequency: "monthly", priority: 0.9 },
    { path: "/aupair/switzerland", changeFrequency: "monthly", priority: 0.9 },
    { path: "/aupair/belgium", changeFrequency: "monthly", priority: 0.8 },
    { path: "/aupair/france", changeFrequency: "monthly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/news", changeFrequency: "daily", priority: 0.8 },
    { path: "/events", changeFrequency: "weekly", priority: 0.7 },
    { path: "/shop", changeFrequency: "weekly", priority: 0.6 },
    { path: "/lessons", changeFrequency: "weekly", priority: 0.6 },
    { path: "/opportunities", changeFrequency: "weekly", priority: 0.7 },
    { path: "/register", changeFrequency: "monthly", priority: 0.8 },
    { path: "/apply", changeFrequency: "monthly", priority: 0.8 },
  ];

  // Generate sitemap entries for every route × every locale
  const entries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    for (const locale of locales) {
      const url = `${baseUrl}/${locale}${route.path}`;

      // Build alternates for hreflang
      const languages: Record<string, string> = {};
      for (const altLocale of locales) {
        languages[altLocale] = `${baseUrl}/${altLocale}${route.path}`;
      }
      // x-default points to English
      languages["x-default"] = `${baseUrl}/en${route.path}`;

      entries.push({
        url,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages,
        },
      });
    }
  }

  return entries;
}
