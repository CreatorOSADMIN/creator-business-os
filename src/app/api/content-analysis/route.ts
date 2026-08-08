import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAnalysisSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifySameOrigin } from "@/lib/verify-origin";
import { getRegisteredCreatorIdFromCookie } from "@/lib/creator-session";
import { getOrCreateAnonymousId } from "@/lib/anonymous-session";
import { CONTENT_ANALYSIS_FREE_LIMIT } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { reportIncident } from "@/lib/monitoring";
import { getVideoAnalysisProvider } from "@/lib/video-providers";
import type { CaPlatform } from "@/lib/content-analysis";

export interface ContentAnalysisHistoryItem {
  id: string;
  platform: string;
  goal: string;
  videoCount: number;
  status: string;
  createdAt: string;
  reportAvailable: boolean;
}

/**
 * Returns this anonymous visitor's own persisted Content Analysis history,
 * newest first. Identity comes only from the existing anonymous-session
 * cookie (see anonymous-session.ts) — never from a query param, body, or
 * other client-supplied value — so a caller can only ever list their own
 * analyses, matching the free-usage counter's identity model.
 */
export async function GET(request: NextRequest) {
  const anonymousId = await getOrCreateAnonymousId();

  // Light polling protection, mirroring early-access/status's identity+ip
  // scoped limit — generous enough for normal page loads/refreshes.
  const ip = getClientIp(request.headers);
  const { allowed } = rateLimit(
    `content-analysis-history:${anonymousId}:${ip}`,
    {
      limit: 60,
      windowMs: 5 * 60 * 1000,
    }
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const analyses = await prisma.contentAnalysis.findMany({
      where: { anonymousId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        platform: true,
        goal: true,
        videoCount: true,
        status: true,
        createdAt: true,
        result: true,
      },
    });

    const history: ContentAnalysisHistoryItem[] = analyses.map((a) => ({
      id: a.id,
      platform: a.platform,
      goal: a.goal,
      videoCount: a.videoCount,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
      reportAvailable:
        a.status === "completed" && a.result !== null,
    }));

    return NextResponse.json({ analyses: history });
  } catch (err) {
    reportIncident("content_analysis_history_failed", {
      scope: "content-analysis",
      ip,
      err,
    });

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Thrown inside the create transaction when the anonymous visitor has
 * already used their free allowance; caught below to return a stable,
 * machine-readable error without treating it as a server failure.
 */
class FreeLimitExhaustedError extends Error {}

/**
 * Runs the real provider fetch for a just-created "queued" analysis and
 * persists the outcome, returning the final status. No production-grade
 * background worker exists yet, so this runs synchronously inline in the
 * request — acceptable here because it's a single batched provider call
 * per submission. Never leaves the record "queued" forever and never
 * fabricates a completed result: every path ends in either "completed"
 * (with real, provider-sourced data in `result`) or "failed" (with a safe,
 * generic `errorMessage`).
 */
async function runProviderAnalysis(
  analysisId: string,
  platform: CaPlatform,
  videoUrls: string[]
): Promise<"completed" | "failed"> {
  const provider = getVideoAnalysisProvider(platform);

  if (!provider) {
    await prisma.contentAnalysis.update({
      where: { id: analysisId },
      data: {
        status: "failed",
        errorMessage:
          "Real analysis for this platform isn't available yet.",
      },
    });

    return "failed";
  }

  await prisma.contentAnalysis.update({
    where: { id: analysisId },
    data: { status: "processing" },
  });

  const startedAt = Date.now();

  try {
    const outcomes = await provider.fetchVideos(videoUrls);
    const successes = outcomes.filter((o) => o.ok);
    const failures = outcomes.filter((o) => !o.ok);

    logger.info("content-analysis: provider fetch finished", {
      scope: "content-analysis",
      analysisId,
      platform,
      provider: provider.id,
      durationMs: Date.now() - startedAt,
      successCount: successes.length,
      failureCount: failures.length,
    });

    if (successes.length === 0) {
      await prisma.contentAnalysis.update({
        where: { id: analysisId },
        data: {
          status: "failed",
          errorMessage:
            "We couldn't retrieve data for any of the submitted videos.",
        },
      });

      return "failed";
    }

    const result = {
      isDemo: false,
      provider: provider.id,
      fetchedAt: new Date().toISOString(),
      videos: successes
        .map((o) => (o.ok ? o.metadata : null))
        .filter(Boolean),
      failedUrls: failures
        .map((o) =>
          !o.ok
            ? {
                url: o.sourceUrl,
                reason: o.reason,
              }
            : null
        )
        .filter(Boolean),
    };

    await prisma.contentAnalysis.update({
      where: { id: analysisId },
      data: {
        status: "completed",
        result: JSON.stringify(result),
        completedAt: new Date(),
      },
    });

    return "completed";
  } catch (err) {
    reportIncident("content_analysis_provider_failed", {
      scope: "content-analysis",
      analysisId,
      platform,
      provider: provider.id,
      durationMs: Date.now() - startedAt,
      err,
    });

    await prisma.contentAnalysis.update({
      where: { id: analysisId },
      data: {
        status: "failed",
        errorMessage:
          "Something went wrong while retrieving this analysis. Please try again.",
      },
    });

    return "failed";
  }
}

/**
 * Creates a persistent Content Analysis record and, when a real provider
 * is configured for the platform (see src/lib/video-providers), fetches
 * real public video metadata for it synchronously before responding.
 *
 * The frontend's simulated demo report
 * (src/lib/content-analysis-engine.ts) is untouched and unrelated to this
 * route — it does not yet read the `result` this persists.
 */
export async function POST(request: NextRequest) {
  const originCheck = verifySameOrigin(request);

  if (originCheck) {
    return originCheck;
  }

  const ip = getClientIp(request.headers);

  const burst = rateLimit(`content-analysis-create-burst:${ip}`, {
    limit: 5,
    windowMs: 30 * 1000,
  });

  if (!burst.allowed) {
    logger.warn("content-analysis: burst rate limit exceeded", {
      scope: "content-analysis",
      ip,
    });

    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const { allowed } = rateLimit(`content-analysis-create:${ip}`, {
    limit: 15,
    windowMs: 10 * 60 * 1000,
  });

  if (!allowed) {
    logger.warn("content-analysis: rate limit exceeded", {
      scope: "content-analysis",
      ip,
    });

    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = createAnalysisSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { platform, goal, videoUrls } = parsed.data;

  // Never trust a creator id supplied by the browser — only the signed,
  // httpOnly session cookie identifies the authenticated creator, and even
  // then it's re-verified against the database before being used as a
  // foreign key.
  let creatorId: string | null = null;

  const cookieCreatorId = await getRegisteredCreatorIdFromCookie();

  if (cookieCreatorId) {
    const creator = await prisma.creator.findUnique({
      where: { id: cookieCreatorId },
      select: { id: true },
    });

    creatorId = creator?.id ?? null;
  }

  // Free-usage identity is always the anonymous cookie, never the creator
  // id — this keeps the allowance stable across login/logout.
  const anonymousId = await getOrCreateAnonymousId();

  try {
    const { analysis, remaining } = await prisma.$transaction(
      async (tx) => {
        // Serialize concurrent requests from the same anonymous visitor so
        // two simultaneous submissions can't both pass the count check
        // before either row is committed.
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${anonymousId}))
        `;

        const usedCount = await tx.contentAnalysis.count({
          where: { anonymousId },
        });

        if (usedCount >= CONTENT_ANALYSIS_FREE_LIMIT) {
          throw new FreeLimitExhaustedError();
        }

        const created = await tx.contentAnalysis.create({
          data: {
            creatorId,
            anonymousId,
            platform,
            goal,
            videoUrls: JSON.stringify(videoUrls),
            videoCount: videoUrls.length,
            status: "queued",
          },
          select: {
            id: true,
            status: true,
          },
        });

        return {
          analysis: created,
          remaining:
            CONTENT_ANALYSIS_FREE_LIMIT - (usedCount + 1),
        };
      }
    );

    // IMPORTANT:
    // The schema validation guarantees the platform is one of the supported
    // analysis platforms. The provider layer uses the narrower CaPlatform
    // union type, so narrow the validated value here before passing it on.
    const finalStatus = await runProviderAnalysis(
      analysis.id,
      platform as CaPlatform,
      videoUrls
    );

    return NextResponse.json(
      {
        ok: true,
        id: analysis.id,
        status: finalStatus,
        remainingFreeAnalyses: remaining,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof FreeLimitExhaustedError) {
      return NextResponse.json(
        {
          error: "You've used all 3 free analyses.",
          code: "FREE_ANALYSES_EXHAUSTED",
          remainingFreeAnalyses: 0,
        },
        { status: 403 }
      );
    }

    reportIncident("content_analysis_create_failed", {
      scope: "content-analysis",
      ip,
      err,
    });

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}