-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Creator" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "emailVerifiedAt" DATETIME,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Creator_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "Creator" ("referralCode") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Creator" ("id","fullName","creatorHandle","email","country","platforms","audienceSize","publishingFrequency","creatorExperience","biggestChallenge","productInterests","marketingConsent","privacyAccepted","status","internalNotes","referralCode","referredBy","referralQualified","utmSource","utmMedium","utmCampaign","createdAt","updatedAt")
SELECT "id","fullName","creatorHandle","email","country","platforms","audienceSize","publishingFrequency","creatorExperience","biggestChallenge","productInterests","marketingConsent","privacyAccepted","status","internalNotes","referralCode","referredBy","referralQualified","utmSource","utmMedium","utmCampaign","createdAt","updatedAt" FROM "Creator";
DROP TABLE "Creator";
ALTER TABLE "new_Creator" RENAME TO "Creator";
CREATE UNIQUE INDEX "Creator_email_key" ON "Creator"("email");
CREATE UNIQUE INDEX "Creator_referralCode_key" ON "Creator"("referralCode");
CREATE INDEX "Creator_status_idx" ON "Creator"("status");
CREATE INDEX "Creator_country_idx" ON "Creator"("country");
PRAGMA foreign_keys=ON;

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailVerificationToken_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_creatorId_idx" ON "EmailVerificationToken"("creatorId");
