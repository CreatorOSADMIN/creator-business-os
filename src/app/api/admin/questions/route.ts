import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { serializeQuestion } from "@/lib/serialize-question";
import { QUESTION_STATUSES } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 25)));

  const where: Prisma.QuestionWhereInput = {};

  if (status && (QUESTION_STATUSES as readonly string[]).includes(status)) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { question: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { answer: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, questions] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      orderBy: { createdAt: sort },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ total, page, pageSize, questions: questions.map(serializeQuestion) });
}
