-- Add GDPR consent audit-trail fields to Creator.
-- Nullable: existing rows have no recorded consent timestamp/version.
ALTER TABLE "Creator" ADD COLUMN "gdprConsentAt" TIMESTAMP(3);
ALTER TABLE "Creator" ADD COLUMN "privacyPolicyVersion" TEXT;
