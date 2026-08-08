import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getOrCreateAnonymousId } from "@/lib/anonymous-session";
import { resolveReportAccess, type ContentAnalysisReportResult } from "@/lib/content-analysis-report";

const GENERIC_FAILURE_MESSAGE = "This analysis failed. Please start a new one.";
const GENERIC_UNREADABLE_MESSAGE = "This analysis result couldn't be read. Please start a new one.";

export interface ContentAnalysisStatusResponse {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  platform: string;
  goal: string;
  videoCount: number;
  reportAvailable: boolean;
  // Only ever present for a status of "completed" with a valid, parsed
  // real result — never demo data, never the raw persisted string. Never
  // includes anonymousId, creatorId, provider id, or any other internal
  // field — see buildReportResult.
  result?: ContentAnalysisReportResult;
  // A safe, pre-written message only — never the raw internal error.
  errorMessage?: string;
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
      errorMessage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Ownership + status/result decision lives in one tested function so an
  // id belonging to another anonymous visitor and a genuinely missing id
  // are indistinguishable to the caller either way.
  const access = resolveReportAccess(
    analysis
      ? {
          anonymousId: analysis.anonymousId,
          status: analysis.status,
          result: analysis.result,
          errorMessage: analysis.errorMessage,
        }
      : null,
    anonymousId
  );

  if (access.kind === "not_found" || !analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const base = {
    id: analysis.id,
    status: analysis.status,
    createdAt: analysis.createdAt.toISOString(),
    updatedAt: analysis.updatedAt.toISOString(),
    platform: analysis.platform,
    goal: analysis.goal,
    videoCount: analysis.videoCount,
  };

  let body: ContentAnalysisStatusResponse;
  switch (access.kind) {
    case "completed":
      body = { ...base, reportAvailable: true, result: access.result };
      break;
    case "completed_invalid":
      body = { ...base, reportAvailable: false, errorMessage: GENERIC_UNREADABLE_MESSAGE };
      break;
    case "failed":
      body = { ...base, reportAvailable: false, errorMessage: GENERIC_FAILURE_MESSAGE };
      break;
    case "processing":
    case "queued":
      body = { ...base, reportAvailable: false };
      break;
  }

  return NextResponse.json(body);
}
