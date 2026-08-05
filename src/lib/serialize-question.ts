import type { Question } from "@prisma/client";

function safeParseArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function serializeQuestion(question: Question) {
  return {
    ...question,
    answerImages: safeParseArray(question.answerImages),
    answerVideos: safeParseArray(question.answerVideos),
    // Publicly displayed total is always real user votes + the admin's
    // manual adjustment — never one or the other alone (see
    // Question.manualUpvotes in schema.prisma).
    totalUpvotes: question.realUpvotes + question.manualUpvotes,
  };
}

export type SerializedQuestion = ReturnType<typeof serializeQuestion>;
