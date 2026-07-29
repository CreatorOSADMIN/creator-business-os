import type { Creator } from "@prisma/client";

/** Column headers for the admin lead export CSV, in row order. */
export const LEAD_CSV_HEADERS = [
  "email",
  "signup_date",
  "verification_status",
  "lead_status",
  "gdpr_consent",
  "gdpr_consent_at",
  "privacy_policy_version",
  "utm_source",
] as const;

export type LeadExportRecord = Pick<
  Creator,
  | "email"
  | "createdAt"
  | "emailVerifiedAt"
  | "status"
  | "privacyAccepted"
  | "gdprConsentAt"
  | "privacyPolicyVersion"
  | "utmSource"
>;

/** Builds a single CSV row (matching LEAD_CSV_HEADERS) for one lead record. */
export function buildLeadCsvRow(creator: LeadExportRecord): string[] {
  return [
    creator.email,
    creator.createdAt.toISOString(),
    creator.emailVerifiedAt ? "verified" : "pending",
    creator.status,
    creator.privacyAccepted ? "true" : "false",
    creator.gdprConsentAt ? creator.gdprConsentAt.toISOString() : "",
    creator.privacyPolicyVersion || "",
    creator.utmSource || "",
  ];
}
