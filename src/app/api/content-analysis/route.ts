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

/** Thrown inside the create transaction when the anonymous visitor has
 * already used their free allowance; caught below to return a stable,
 * machine-readable error without treating it as a server failure. */
class FreeLimitExhaustedError extends Error {}

/**
 * Creates a persistent Content Analysis record from the (still simulated)
 * /content-analysis form. No analysis is performed here — this only turns a
 * validated submission into a "queued" database record that later patches
 * can pick up. See src/lib/content-analysis-engine.ts for the report
 * generation, which stays untouched and unrelated to this route.
 */
export async function POST(request: NextRequest) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const ip = getClientIp(request.headers);

  const burst = rateLimit(`content-analysis-create-burst:${ip}`, {
    limit: 5,
    windowMs: 30 * 1000,
  });
  if (!burst.allowed) {
    logger.warn("content-analysis: burst rate limit exceeded", { scope: "content-analysis", ip });
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
    logger.warn("content-analysis: rate limit exceeded", { scope: "content-analysis", ip });
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createAnalysisSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { platform, goal, videoUrls } = parsed.data;

  // Never trust a creator id supplied by the browser — only the signed,
  // httpOnly session cookie identifies the authenticated creator, and even
  // then it's re-verified against the database (the cookie can outlive the
  // record, e.g. if it was deleted) before being used as a foreign key.
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
  // id — this keeps the allowance stable across login/logout so it can't
  // be reset by simply signing in or out on the same browser.
  const anonymousId = await getOrCreateAnonymousId();

  try {
    const { analysis, remaining } = await prisma.$transaction(async (tx) => {
      // Serialize concurrent requests from the same anonymous visitor so
      // two simultaneous submissions can't both pass the count check
      // before either row is committed. Advisory lock is scoped to this
      // transaction and releases automatically at commit/rollback.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${anonymousId}))`;

      const usedCount = await tx.contentAnalysis.count({ where: { anonymousId } });
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
        select: { id: true, status: true },
      });

      return { analysis: created, remaining: CONTENT_ANALYSIS_FREE_LIMIT - (usedCount + 1) };
    });

    return NextResponse.json(
      { ok: true, id: analysis.id, status: analysis.status, remainingFreeAnalyses: remaining },
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
    reportIncident("content_analysis_create_failed", { scope: "content-analysis", ip, err });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
