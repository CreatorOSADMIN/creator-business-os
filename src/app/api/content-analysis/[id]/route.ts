import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getOrCreateAnonymousId } from "@/lib/anonymous-session";

export interface ContentAnalysisStatusResponse {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  platform: string;
  goal: string;
  videoCount: number;
  reportAvailable: boolean;
}

/**
 * Returns the persisted status of a single Content Analysis, scoped to the
 * requesting anonymous visitor only. Identity comes solely from the
 * existing anonymous-session cookie (never a client-supplied id), matching
 * the ownership model already used by GET /api/content-analysis. A record
 * that doesn't exist and one that exists but belongs to someone else are
 * both reported as a generic 404 so ownership can't be probed.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const anonymousId = await getOrCreateAnonymousId();

  const ip = getClientIp(request.headers);
  const { allowed } = rateLimit(`content-analysis-status:${anonymousId}:${ip}`, {
    limit: 120,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const { id } = await params;

  const analysis = await prisma.contentAnalysis.findUnique({
    where: { id },
    select: {
      id: true,
      anonymousId: true,
      platform: true,
      goal: true,
      videoCount: true,
      status: true,
      result: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Same response whether the row is missing or owned by another visitor —
  // never confirm that a given id exists for someone else.
  if (!analysis || analysis.anonymousId !== anonymousId) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const body: ContentAnalysisStatusResponse = {
    id: analysis.id,
    status: analysis.status,
    createdAt: analysis.createdAt.toISOString(),
    updatedAt: analysis.updatedAt.toISOString(),
    platform: analysis.platform,
    goal: analysis.goal,
    videoCount: analysis.videoCount,
    reportAvailable: analysis.status === "completed" && analysis.result !== null,
  };

  return NextResponse.json(body);
}
