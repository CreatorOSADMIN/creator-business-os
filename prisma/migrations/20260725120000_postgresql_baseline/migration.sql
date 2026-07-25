-- PostgreSQL baseline migration.
--
-- This replaces the three SQLite-only migrations previously in
-- prisma/migrations (now kept for reference in
-- prisma/migrations-sqlite-archive/, outside Prisma's active migrations
-- folder so they are never applied against PostgreSQL). It creates the
-- schema in its final, current state (equivalent to init +
-- email_verification + creator_referredby_index combined), with SQLite-only
-- syntax (DATETIME, PRAGMA table rebuilds) translated to PostgreSQL
-- equivalents. No models, fields, relations, indexes or defaults were
-- added, removed or renamed.

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "creatorHandle" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "platforms" TEXT NOT NULL,
    "audienceSize" TEXT NOT NULL,
    "publishingFrequency" TEXT NOT NULL,
    "creatorExperience" TEXT NOT NULL,
    "biggestChallenge" TEXT NOT NULL,
    "productInterests" TEXT NOT NULL,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "referralCode" TEXT NOT NULL,
    "referredBy" TEXT,
    "referralQualified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_email_key" ON "Creator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_referralCode_key" ON "Creator"("referralCode");

-- CreateIndex
CREATE INDEX "Creator_status_idx" ON "Creator"("status");

-- CreateIndex
CREATE INDEX "Creator_country_idx" ON "Creator"("country");

-- CreateIndex
CREATE INDEX "Creator_referredBy_idx" ON "Creator"("referredBy");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_creatorId_idx" ON "EmailVerificationToken"("creatorId");

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "Creator"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
