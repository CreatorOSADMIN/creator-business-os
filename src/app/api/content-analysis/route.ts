import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAnalysisSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifySameOrigin } from "@/lib/verify-origin";
import { getRegisteredCreatorIdFromCookie } from "@/lib/creator-session";
import { logger } from "@/lib/logger";
import { reportIncident } from "@/lib/monitoring";

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

  try {
    const analysis = await prisma.contentAnalysis.create({
      data: {
        creatorId,
        platform,
        goal,
        videoUrls: JSON.stringify(videoUrls),
        videoCount: videoUrls.length,
        status: "queued",
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, id: analysis.id, status: analysis.status }, { status: 201 });
  } catch (err) {
    reportIncident("content_analysis_create_failed", { scope: "content-analysis", ip, err });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
