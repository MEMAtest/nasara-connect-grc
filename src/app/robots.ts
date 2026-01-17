import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/features",
          "/solutions",
          "/audience",
          "/pricing",
          "/resources",
          "/resources/guides",
          "/resources/templates",
          "/blog",
          "/case-studies",
          "/tools",
          "/contact",
          "/about",
          "/grc-platform",
          "/security",
        ],
        disallow: [
          "/api",
          "/auth",
          "/authorization-pack",
          "/policies",
          "/smcr",
          "/risk-assessment",
          "/training-library",
          "/compliance-framework",
          "/compliance-framework/builder",
          "/compliance-framework/monitoring",
          "/payments",
          "/settings",
          "/support",
          "/logout",
          "/regulatory-news",
          "/ai-chat",
        ],
      },
    ],
    sitemap: "https://nasaraconnect.com/sitemap.xml",
  };
}
