import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { serializeCreator } from "@/lib/serialize-creator";
import { CREATOR_STATUSES } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";
  const status = searchParams.get("status") || "";
  const platform = searchParams.get("platform") || "";
  const country = searchParams.get("country") || "";
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 25)));

  const where: Prisma.CreatorWhereInput = {};

  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { creatorHandle: { contains: search } },
      { email: { contains: search } },
    ];
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

  const [total, creators] = await Promise.all([
    prisma.creator.count({ where }),
    prisma.creator.findMany({
      where,
      orderBy: { createdAt: sort },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    creators: creators.map(serializeCreator),
  });
}
