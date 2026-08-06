import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { askQuestionSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifySameOrigin } from "@/lib/verify-origin";
import { serializeQuestion } from "@/lib/serialize-question";
import { findRankedQuestions, countRankedQuestions } from "@/lib/question-ranking";
import { logger } from "@/lib/logger";
import { reportIncident } from "@/lib/monitoring";
import { QUESTION_CATEGORIES } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

const SORTABLE_FIELDS = ["latest", "recently_answered"] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category") || "";
  const sortParam = searchParams.get("sort") || "latest";
  const sort: (typeof SORTABLE_FIELDS)[number] = (SORTABLE_FIELDS as readonly string[]).includes(
    sortParam
  )
    ? (sortParam as (typeof SORTABLE_FIELDS)[number])
    : "latest";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || 12)));

  const validCategory = category && (QUESTION_CATEGORIES as readonly string[]).includes(category) ? category : "";

  // "latest" (the /questions page default) ranks by total upvotes
  // (realUpvotes + manualUpvotes) desc, then publishedAt desc — done in the
  // database via findRankedQuestions, not by sorting in JS. "recently_answered"
  // stays a pure publishedAt sort, which is the distinct, date-driven option
  // the tab already offered.
  if (sort === "recently_answered") {
    const where: Prisma.QuestionWhereInput = { status: "published" };
    if (search) {
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { answer: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }
    if (validCategory) where.category = validCategory;

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      total,
      page,
      pageSize,
      questions: questions.map(serializeQuestion),
    });
  }

  const filters = { search, category: validCategory, skip: (page - 1) * pageSize, take: pageSize };
  const [total, questions] = await Promise.all([
    countRankedQuestions(filters),
    findRankedQuestions(filters),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    questions: questions.map(serializeQuestion),
  });
}

export async function POST(request: NextRequest) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const ip = getClientIp(request.headers);

  const burst = rateLimit(`ask-question-burst:${ip}`, { limit: 3, windowMs: 30 * 1000 });
  if (!burst.allowed) {
    logger.warn("questions: burst rate limit exceeded", { scope: "questions", ip });
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const { allowed } = rateLimit(`ask-question:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    logger.warn("questions: rate limit exceeded", { scope: "questions", ip });
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

  // Honeypot field: bots that fill hidden fields are silently accepted
  // without revealing detection logic to the client.
  if (typeof body === "object" && body !== null && "website" in body && (body as { website?: string }).website) {
    logger.warn("questions: rejected — honeypot field filled", { scope: "questions", ip });
    return NextResponse.json({ ok: true, questionId: "ignored" }, { status: 201 });
  }

  const MIN_FILL_TIME_MS = 1200;
  if (typeof body === "object" && body !== null && "formRenderedAt" in body) {
    const renderedAt = Number((body as { formRenderedAt?: unknown }).formRenderedAt);
    const elapsed = Date.now() - renderedAt;
    if (Number.isFinite(renderedAt) && elapsed >= 0 && elapsed < MIN_FILL_TIME_MS) {
      logger.warn("questions: rejected — filled too fast (likely automated)", {
        scope: "questions",
        ip,
        elapsedMs: elapsed,
      });
      return NextResponse.json({ ok: true, questionId: "ignored" }, { status: 201 });
    }
  }

  const parsed = askQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const question = await prisma.question.create({
      data: {
        username: parsed.data.username,
        question: parsed.data.question,
        category: parsed.data.category || null,
        status: "pending",
      },
    });

    return NextResponse.json({ ok: true, questionId: question.id }, { status: 201 });
  } catch (err) {
    reportIncident("question_submit_failed", { scope: "questions", ip, err });
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
