-- Question upvotes: admin-adjustable manual count, plus a real per-IP vote
-- ledger enforced unique at the database level to prevent duplicate votes.

ALTER TABLE "Question" ADD COLUMN "realUpvotes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Question" ADD COLUMN "manualUpvotes" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "QuestionUpvote" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionUpvote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuestionUpvote_questionId_idx" ON "QuestionUpvote"("questionId");

CREATE UNIQUE INDEX "QuestionUpvote_questionId_ipHash_key" ON "QuestionUpvote"("questionId", "ipHash");

ALTER TABLE "QuestionUpvote" ADD CONSTRAINT "QuestionUpvote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
