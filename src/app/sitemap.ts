import type { MetadataRoute } from "next";
import {
  SITE_URL,
  FEATURE_PAGES,
  SOLUTION_PAGES,
  AUDIENCE_PAGES,
  RESOURCE_GUIDES,
  RESOURCE_TEMPLATES,
  BLOG_POSTS,
  CASE_STUDIES,
  TOOLS,
} from "@/lib/seo/marketing-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "/",
    "/features",
    "/solutions",
    "/audience",
    "/pricing",
    "/grc-platform",
    "/resources",
    "/resources/guides",
    "/resources/templates",
    "/blog",
    "/case-studies",
    "/contact",
    "/about",
    "/security",
  ];

  const dynamicRoutes = [
    ...FEATURE_PAGES.map((page) => `/features/${page.slug}`),
    ...SOLUTION_PAGES.map((page) => `/solutions/${page.slug}`),
    ...AUDIENCE_PAGES.map((page) => `/audience/${page.slug}`),
    ...RESOURCE_GUIDES.map((page) => `/resources/guides/${page.slug}`),
    ...RESOURCE_TEMPLATES.map((page) => `/resources/templates/${page.slug}`),
    ...BLOG_POSTS.map((page) => `/blog/${page.slug}`),
    ...CASE_STUDIES.map((page) => `/case-studies/${page.slug}`),
    ...TOOLS.map((tool) => `/tools/${tool.slug}`),
  ];

  const routes = [...staticRoutes, ...dynamicRoutes];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
  }));
}
