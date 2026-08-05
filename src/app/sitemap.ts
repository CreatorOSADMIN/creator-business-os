import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";
import { QUESTION_CATEGORIES, QUESTION_CATEGORY_SLUGS } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  // SEO priority per route, reflecting relative importance in the site
  // hierarchy (homepage highest, legal pages lowest).
  const ROUTE_PRIORITIES: Record<string, number> = {
    "": 1,
    "/early-access": 0.9,
    "/questions": 0.8,
    "/about": 0.5,
    "/updates": 0.5,
    "/contact": 0.5,
    "/privacy": 0.3,
    "/terms": 0.3,
  };
  const routes = Object.keys(ROUTE_PRIORITIES);

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: ROUTE_PRIORITIES[route],
  }));

  const categoryEntries: MetadataRoute.Sitemap = QUESTION_CATEGORIES.map((category) => ({
    url: `${siteUrl}/questions/category/${QUESTION_CATEGORY_SLUGS[category]}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const questions = await prisma.question.findMany({
    where: { status: "published", slug: { not: null } },
    select: { slug: true, updatedAt: true },
  });

  const questionEntries: MetadataRoute.Sitemap = questions
    .filter((q) => q.slug)
    .map((q) => ({
      url: `${siteUrl}/questions/${q.slug}`,
      lastModified: q.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticEntries, ...categoryEntries, ...questionEntries];
}
