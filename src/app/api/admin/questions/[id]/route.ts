import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { serializeQuestion } from "@/lib/serialize-question";
import { questionAnswerSchema } from "@/lib/validation";
import { verifySameOrigin } from "@/lib/verify-origin";
import { logAdminAction } from "@/lib/audit-log";
import { logger } from "@/lib/logger";
import { generateUniqueSlug } from "@/lib/slug";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({ question: serializeQuestion(question) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const { session, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = questionAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const nextStatus = parsed.data.status ?? existing.status;
  const isPublishing = nextStatus === "published";

  // Publishing (whether for the first time, or re-publishing after an
  // edit) requires actual answer content and a slug. A slug, once
  // assigned, is kept stable across edits so the public URL never changes.
  if (isPublishing) {
    const answerText = parsed.data.answer ?? existing.answer;
    if (!answerText || !answerText.trim()) {
      return NextResponse.json(
        { error: "Write an answer before publishing." },
        { status: 400 }
      );
    }
  }

  let slug = existing.slug;
  if (isPublishing && !slug) {
    slug = await generateUniqueSlug(existing.question, async (candidate) => {
      const clash = await prisma.question.findUnique({ where: { slug: candidate } });
      return Boolean(clash && clash.id !== id);
    });
  }

  const question = await prisma.question.update({
    where: { id },
    data: {
      ...(parsed.data.answer !== undefined ? { answer: parsed.data.answer } : {}),
      ...(parsed.data.answerImages !== undefined
        ? { answerImages: JSON.stringify(parsed.data.answerImages) }
        : {}),
      ...(parsed.data.answerVideos !== undefined
        ? { answerVideos: JSON.stringify(parsed.data.answerVideos) }
        : {}),
      ...(parsed.data.category !== undefined ? { category: parsed.data.category } : {}),
      status: nextStatus,
      slug,
      // Explicit admin-provided publication date always wins. Otherwise,
      // fall back to the previous default of stamping "now" the first time
      // a question is published.
      ...(parsed.data.publishedAt !== undefined
        ? { publishedAt: parsed.data.publishedAt }
        : isPublishing && !existing.publishedAt
          ? { publishedAt: new Date() }
          : {}),
    },
  });

  logAdminAction({
    action: isPublishing ? "question.publish" : "question.update",
    actor: session.email,
    questionId: id,
    metadata: { status: nextStatus },
  });

  return NextResponse.json({ question: serializeQuestion(question) });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const { session, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid question id" }, { status: 400 });
  }

  try {
    await prisma.question.delete({ where: { id } });
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    logger.error("questions: delete failed", { scope: "admin-questions-delete", questionId: id, err });
    return NextResponse.json({ error: "Unable to delete this question. Please try again." }, { status: 500 });
  }

  logAdminAction({ action: "question.delete", actor: session.email, questionId: id });

  return NextResponse.json({ success: true });
}
