import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { serializeCreator } from "@/lib/serialize-creator";
import { CREATOR_STATUSES } from "@/lib/constants";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const [total, statusGroups, allCreators, recent] = await Promise.all([
    prisma.creator.count(),
    prisma.creator.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.creator.findMany({ select: { platforms: true, audienceSize: true, country: true } }),
    prisma.creator.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const byStatus: Record<string, number> = Object.fromEntries(
    CREATOR_STATUSES.map((s) => [s, 0])
  );
  for (const group of statusGroups) {
    byStatus[group.status] = group._count.status;
  }

  const byPlatform: Record<string, number> = {};
  const byAudience: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  for (const creator of allCreators) {
    let platforms: string[] = [];
    try {
      platforms = JSON.parse(creator.platforms);
    } catch {
      platforms = [];
    }
    for (const platform of platforms) {
      byPlatform[platform] = (byPlatform[platform] || 0) + 1;
    }
    byAudience[creator.audienceSize] = (byAudience[creator.audienceSize] || 0) + 1;
    byCountry[creator.country] = (byCountry[creator.country] || 0) + 1;
  }

  return NextResponse.json({
    total,
    byStatus,
    byPlatform,
    byAudience,
    byCountry,
    recent: recent.map(serializeCreator),
  });
}
