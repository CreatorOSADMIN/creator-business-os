import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { hashIp } from "@/lib/ip-hash";
import { verifySameOrigin } from "@/lib/verify-origin";
import { serializeQuestion } from "@/lib/serialize-question";
import { logger } from "@/lib/logger";
import { QUESTION_CATEGORY_SLUGS } from "@/lib/constants";

async function findPublishedQuestion(slug: string) {
  return prisma.question.findFirst({ where: { slug, status: "published" } });
}

function revalidateQuestionPaths(question: { slug: string | null; category: string | null }) {
  revalidatePath("/questions");
  if (question.slug) revalidatePath(`/questions/${question.slug}`);
  if (question.category && question.category in QUESTION_CATEGORY_SLUGS) {
    revalidatePath(`/questions/category/${QUESTION_CATEGORY_SLUGS[question.category as keyof typeof QUESTION_CATEGORY_SLUGS]}`);
  }
}

// Current total + whether this visitor (by hashed IP) has already voted.
// Called client-side on mount so the (cached/ISR) page itself never needs
// to be personalized per-visitor.
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const question = await findPublishedQuestion(slug);
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const ipHash = hashIp(getClientIp(request.headers));
  const existingVote = await prisma.questionUpvote.findUnique({
    where: { questionId_ipHash: { questionId: question.id, ipHash } },
    select: { id: true },
  });

  return NextResponse.json({
    totalUpvotes: serializeQuestion(question).totalUpvotes,
    hasVoted: Boolean(existingVote),
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const { slug } = await params;
  const question = await findPublishedQuestion(slug);
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const ip = getClientIp(request.headers);

  // Defense-in-depth against a single IP hammering the endpoint (e.g. a
  // script retrying past a network hiccup). The real duplicate-vote
  // prevention is the (questionId, ipHash) unique index below, not this.
  const burst = rateLimit(`question-upvote:${ip}`, { limit: 10, windowMs: 60 * 1000 });
  if (!burst.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const ipHash = hashIp(ip);

  try {
    // A single nested write: Prisma runs the Question update and the
    // QuestionUpvote insert in one transaction, so a mid-way failure (e.g.
    // the unique constraint below) can never leave the count incremented
    // without a matching vote row, or vice versa.
    const updated = await prisma.question.update({
      where: { id: question.id },
      data: {
        realUpvotes: { increment: 1 },
        upvoteRecords: { create: { ipHash } },
      },
    });

    revalidateQuestionPaths(updated);

    return NextResponse.json({
      totalUpvotes: serializeQuestion(updated).totalUpvotes,
      hasVoted: true,
    });
  } catch (err) {
    // P2002 = unique constraint violation on (questionId, ipHash) — this IP
    // already voted for this question. Not an error from the user's point
    // of view: report the current, unchanged state as an already-voted
    // success rather than a failure.
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      const current = await prisma.question.findUnique({ where: { id: question.id } });
      return NextResponse.json({
        totalUpvotes: current ? serializeQuestion(current).totalUpvotes : serializeQuestion(question).totalUpvotes,
        hasVoted: true,
      });
    }

    logger.error("questions: upvote failed", { scope: "questions-upvote", questionId: question.id, err });
    return NextResponse.json({ error: "Unable to record your upvote. Please try again." }, { status: 500 });
  }
}

// Toggle-off: removes this visitor's own vote. Same (questionId, ipHash)
// identity as POST — a voter can only ever remove their own vote, never
// anyone else's, since ipHash is derived from the request, not user input.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const { slug } = await params;
  const question = await findPublishedQuestion(slug);
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const ip = getClientIp(request.headers);
  const burst = rateLimit(`question-upvote:${ip}`, { limit: 10, windowMs: 60 * 1000 });
  if (!burst.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const ipHash = hashIp(ip);

  try {
    const existingVote = await prisma.questionUpvote.findUnique({
      where: { questionId_ipHash: { questionId: question.id, ipHash } },
      select: { id: true },
    });

    if (!existingVote) {
      // Nothing to remove — report current state as success rather than an
      // error, mirroring the P2002-as-success branch in POST above.
      return NextResponse.json({
        totalUpvotes: serializeQuestion(question).totalUpvotes,
        hasVoted: false,
      });
    }

    // Same transactional pairing as the POST insert: the decrement and the
    // QuestionUpvote delete happen together, so the denormalized count can
    // never drift from the underlying vote rows.
    const [updated] = await prisma.$transaction([
      prisma.question.update({
        where: { id: question.id },
        data: { realUpvotes: { decrement: 1 } },
      }),
      prisma.questionUpvote.delete({ where: { id: existingVote.id } }),
    ]);

    revalidateQuestionPaths(updated);

    return NextResponse.json({
      totalUpvotes: serializeQuestion(updated).totalUpvotes,
      hasVoted: false,
    });
  } catch (err) {
    logger.error("questions: remove upvote failed", { scope: "questions-upvote", questionId: question.id, err });
    return NextResponse.json({ error: "Unable to remove your upvote. Please try again." }, { status: 500 });
  }
}
