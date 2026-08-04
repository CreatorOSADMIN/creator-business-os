-- Public Q&A feature: anonymous-but-named question submissions, answered
-- and published by an admin.
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "slug" TEXT,
    "answer" TEXT,
    "answerImages" TEXT NOT NULL DEFAULT '[]',
    "answerVideos" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Question_slug_key" ON "Question"("slug");

CREATE INDEX "Question_status_createdAt_idx" ON "Question"("status", "createdAt");

CREATE INDEX "Question_status_publishedAt_idx" ON "Question"("status", "publishedAt");
