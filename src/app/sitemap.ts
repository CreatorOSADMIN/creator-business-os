import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";
import { QUESTION_CATEGORIES, QUESTION_CATEGORY_SLUGS } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const routes = ["", "/early-access", "/questions", "/updates", "/about", "/contact", "/privacy", "/terms"];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = QUESTION_CATEGORIES.map((category) => ({
    url: `${siteUrl}/questions/category/${QUESTION_CATEGORY_SLUGS[category]}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
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
