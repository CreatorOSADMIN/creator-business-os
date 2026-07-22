-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "creatorHandle" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "platforms" TEXT NOT NULL,
    "platformUrls" TEXT NOT NULL,
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
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Creator_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "Creator" ("referralCode") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_email_key" ON "Creator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_referralCode_key" ON "Creator"("referralCode");

-- CreateIndex
CREATE INDEX "Creator_status_idx" ON "Creator"("status");

-- CreateIndex
CREATE INDEX "Creator_country_idx" ON "Creator"("country");
