import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kerlos-church.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/families",
          "/families/*",
          "/servants",
          "/servants/*",
          "/priests",
          "/priests/*",
          "/login",
          "/forgot-password",
          "/verify",
          "/reset-password",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
