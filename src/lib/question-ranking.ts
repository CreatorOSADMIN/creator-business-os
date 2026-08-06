import { Prisma } from "@prisma/client";
import type { Question } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface RankedQuestionFilters {
  search?: string;
  category?: string | null;
  skip?: number;
  take?: number;
}

function buildWhere({ search = "", category }: Pick<RankedQuestionFilters, "search" | "category">) {
  const conditions: Prisma.Sql[] = [Prisma.sql`status = 'published'`];

  if (search) {
    const like = `%${search}%`;
    conditions.push(
      Prisma.sql`(question ILIKE ${like} OR answer ILIKE ${like} OR username ILIKE ${like})`
    );
  }

  if (category) {
    conditions.push(Prisma.sql`category = ${category}`);
  }

  return Prisma.join(conditions, " AND ");
}

// Published questions ordered by total upvotes (realUpvotes + manualUpvotes,
// the same total serializeQuestion computes) descending, then by
// publishedAt descending. Prisma's orderBy can't express a sum of two
// columns, so this is a raw, parameterized query — the ranking (and
// pagination) happens in the database, not by sorting in JS after fetch.
export async function findRankedQuestions(filters: RankedQuestionFilters = {}): Promise<Question[]> {
  const { skip = 0, take = 12 } = filters;
  const where = buildWhere(filters);

  return prisma.$queryRaw<Question[]>`
    SELECT * FROM "Question"
    WHERE ${where}
    ORDER BY ("realUpvotes" + "manualUpvotes") DESC, "publishedAt" DESC
    LIMIT ${take} OFFSET ${skip}
  `;
}

export async function countRankedQuestions(
  filters: Pick<RankedQuestionFilters, "search" | "category"> = {}
): Promise<number> {
  const where = buildWhere(filters);
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count FROM "Question" WHERE ${where}
  `;
  return Number(rows[0]?.count ?? 0);
}
