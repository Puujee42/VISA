import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://mongolianaupair.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/dashboard",
          "/prompt-dashboard",
          "/sign-in",
          "/sign-up",
          "/submit-documents",
          "/student-information",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
