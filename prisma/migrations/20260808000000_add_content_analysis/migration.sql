-- Database foundation for the future real Content Analysis product.
-- Additive only: new table, no changes to existing tables.

CREATE TABLE "ContentAnalysis" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT,
    "anonymousId" TEXT,
    "platform" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "videoUrls" TEXT NOT NULL DEFAULT '[]',
    "videoCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ContentAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContentAnalysis_creatorId_idx" ON "ContentAnalysis"("creatorId");

CREATE INDEX "ContentAnalysis_anonymousId_idx" ON "ContentAnalysis"("anonymousId");

CREATE INDEX "ContentAnalysis_status_idx" ON "ContentAnalysis"("status");

ALTER TABLE "ContentAnalysis" ADD CONSTRAINT "ContentAnalysis_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
