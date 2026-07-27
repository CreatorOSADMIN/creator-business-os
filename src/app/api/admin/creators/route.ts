import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { serializeCreator } from "@/lib/serialize-creator";
import { CREATOR_STATUSES, AUDIENCE_SIZES, PLATFORMS, audienceSizeRank } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

const SORTABLE_FIELDS = ["createdAt", "audienceSize", "fullName", "status"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";
  const status = searchParams.get("status") || "";
  const platform = searchParams.get("platform") || "";
  const country = searchParams.get("country") || "";
  const audienceSize = searchParams.get("audienceSize") || "";
  const emailVerified = searchParams.get("emailVerified") || ""; // "true" | "false" | ""
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";
  const sortByParam = searchParams.get("sortBy") || "createdAt";
  const sortBy: SortableField = (SORTABLE_FIELDS as readonly string[]).includes(sortByParam)
    ? (sortByParam as SortableField)
    : "createdAt";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 25)));

  const where: Prisma.CreatorWhereInput = {};

  if (search) {
    const searchOr: Prisma.CreatorWhereInput[] = [
      { fullName: { contains: search } },
      { creatorHandle: { contains: search } },
      { email: { contains: search } },
    ];
    // Also let the free-text box match a platform name (e.g. "youtube"),
    // so search covers name/handle/email/platform without a separate field.
    const matchedPlatform = PLATFORMS.find(
      (p) => p.label.toLowerCase() === search.toLowerCase() || p.value.toLowerCase() === search.toLowerCase()
    );
    if (matchedPlatform) {
      searchOr.push({ platforms: { contains: `"${matchedPlatform.value}"` } });
    }
    where.OR = searchOr;
  }

  if (status && (CREATOR_STATUSES as readonly string[]).includes(status)) {
    where.status = status;
  }

  if (country) {
    where.country = country;
  }

  if (platform) {
    where.platforms = { contains: `"${platform}"` };
  }

  if (audienceSize && (AUDIENCE_SIZES as readonly { value: string }[]).some((a) => a.value === audienceSize)) {
    where.audienceSize = audienceSize;
  }

  if (emailVerified === "true") {
    where.emailVerifiedAt = { not: null };
  } else if (emailVerified === "false") {
    where.emailVerifiedAt = null;
  }

  const total = await prisma.creator.count({ where });

  if (sortBy === "createdAt") {
    const creators = await prisma.creator.findMany({
      where,
      orderBy: { createdAt: sort },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return NextResponse.json({ total, page, pageSize, creators: creators.map(serializeCreator) });
  }

  // audienceSize/fullName/status aren't sortable at the DB level the way we
  // need (audienceSize is a category, not a number), so fetch the filtered
  // set and sort/paginate in memory. Fine for an early-access-sized list;
  // revisit with a DB-level ranking column if this ever needs to scale.
  const all = await prisma.creator.findMany({ where, orderBy: { createdAt: "desc" } });
  const dir = sort === "asc" ? 1 : -1;
  all.sort((a, b) => {
    if (sortBy === "audienceSize") return dir * (audienceSizeRank(a.audienceSize) - audienceSizeRank(b.audienceSize));
    if (sortBy === "fullName") return dir * a.fullName.localeCompare(b.fullName);
    return dir * a.status.localeCompare(b.status);
  });
  const creators = all.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  return NextResponse.json({
    total,
    page,
    pageSize,
    creators: creators.map(serializeCreator),
  });
}
