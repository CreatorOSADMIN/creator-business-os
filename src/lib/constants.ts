// Only set once a real campaign exists — set NEXT_PUBLIC_GOFUNDME_URL in the
// environment. Left unset, the site shows a neutral message instead of a
// link that would go nowhere real.
export const GOFUNDME_URL = process.env.NEXT_PUBLIC_GOFUNDME_URL || null;

export const PLATFORMS = [
  { value: "YOUTUBE", label: "YouTube" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "TWITCH", label: "Twitch" },
  { value: "OTHER", label: "Other" },
] as const;

export type PlatformValue = (typeof PLATFORMS)[number]["value"];

export const AUDIENCE_SIZES = [
  { value: "UNDER_5K", label: "Under 5,000" },
  { value: "5K_10K", label: "5,000 - 10,000" },
  { value: "10K_50K", label: "10,000 - 50,000" },
  { value: "50K_100K", label: "50,000 - 100,000" },
  { value: "100K_500K", label: "100,000 - 500,000" },
  { value: "500K_PLUS", label: "500,000+" },
] as const;

export type AudienceSizeValue = (typeof AUDIENCE_SIZES)[number]["value"];

// Real-size ordering (index in AUDIENCE_SIZES, ascending = smallest first).
// Unknown/legacy values sort last so they don't break ordering.
const AUDIENCE_SIZE_RANK: Record<string, number> = Object.fromEntries(
  AUDIENCE_SIZES.map((a, i) => [a.value, i])
);
export function audienceSizeRank(value: string): number {
  return AUDIENCE_SIZE_RANK[value] ?? AUDIENCE_SIZES.length;
}

export const PUBLISHING_FREQUENCIES = [
  { value: "DAILY", label: "Daily" },
  { value: "SEVERAL_PER_WEEK", label: "Several times per week" },
  { value: "WEEKLY", label: "Once a week" },
  { value: "SEVERAL_PER_MONTH", label: "Several times per month" },
  { value: "IRREGULAR", label: "Irregularly" },
] as const;

export const CREATOR_EXPERIENCE = [
  { value: "UNDER_1Y", label: "Less than 1 year" },
  { value: "1_2Y", label: "1-2 years" },
  { value: "2_5Y", label: "2-5 years" },
  { value: "5Y_PLUS", label: "5+ years" },
] as const;

export const PRODUCT_INTERESTS = [
  { value: "CONTENT_PERFORMANCE", label: "Understanding why some content performs better" },
  { value: "RECOMMENDATIONS", label: "Getting personalized recommendations" },
  { value: "MULTI_PLATFORM", label: "Managing multiple social platforms" },
  { value: "AUDIENCE_INSIGHTS", label: "Understanding my audience" },
  { value: "BRAND_OPPORTUNITIES", label: "Finding brand opportunities" },
  { value: "OTHER", label: "Other" },
] as const;

export const CREATOR_STATUSES = [
  "NEW",
  "VERIFIED",
  "CONTACTED",
  "INTERVIEW_SCHEDULED",
  "INTERESTED",
  "BETA",
  "CONVERTED",
  "PAID",
  "REJECTED",
] as const;

export type CreatorStatusValue = (typeof CREATOR_STATUSES)[number];

export const STATUS_LABELS: Record<CreatorStatusValue, string> = {
  NEW: "New",
  VERIFIED: "Verified",
  CONTACTED: "Contacted",
  INTERVIEW_SCHEDULED: "Interview scheduled",
  INTERESTED: "Interested",
  BETA: "Beta",
  CONVERTED: "Converted",
  PAID: "Paid",
  REJECTED: "Rejected",
};

export const STATUS_COLORS: Record<CreatorStatusValue, string> = {
  NEW: "badge-neutral",
  VERIFIED: "badge-accent",
  CONTACTED: "badge-accent",
  INTERVIEW_SCHEDULED: "badge-highlight",
  INTERESTED: "badge-highlight",
  BETA: "badge-accent",
  CONVERTED: "badge-accent",
  PAID: "badge-accent",
  REJECTED: "badge-danger",
};

// --- Content Analysis (database foundation only; demo flow still uses
// src/lib/content-analysis.ts and never touches this) ----------------------

export const CONTENT_ANALYSIS_STATUSES = [
  "queued",
  "processing",
  "completed",
  "failed",
] as const;

export type ContentAnalysisStatusValue = (typeof CONTENT_ANALYSIS_STATUSES)[number];

export const CONTENT_ANALYSIS_MAX_URLS = 10;

// Free analyses allowed per anonymous visitor (see anonymous-session.ts)
// before /api/content-analysis rejects further creation. Enforced
// server-side only; the browser is never trusted to report usage.
export const CONTENT_ANALYSIS_FREE_LIMIT = 3;

// --- Public Q&A -----------------------------------------------------------

export const QUESTION_STATUSES = ["pending", "published"] as const;
export type QuestionStatusValue = (typeof QUESTION_STATUSES)[number];

export const QUESTION_STATUS_LABELS: Record<QuestionStatusValue, string> = {
  pending: "Pending",
  published: "Published",
};

// Free-text but constrained to a known set in the ask form, so /questions
// can offer a meaningful category filter without moderation overhead.
export const QUESTION_CATEGORIES = [
  "General",
  "Getting Started",
  "Pricing & Plans",
  "Platforms & Integrations",
  "Analytics",
  "Brand Deals",
  "Account & Billing",
  "Other",
] as const;
export type QuestionCategoryValue = (typeof QUESTION_CATEGORIES)[number];

// URL-safe slug for each category, used by the indexable
// /questions/category/[category] pages. Derived from QUESTION_CATEGORIES so
// there is a single source of truth and no risk of drifting from the values
// actually stored on Question records.
function slugifyCategory(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const QUESTION_CATEGORY_SLUGS: Record<QuestionCategoryValue, string> =
  QUESTION_CATEGORIES.reduce(
    (acc, label) => {
      acc[label] = slugifyCategory(label);
      return acc;
    },
    {} as Record<QuestionCategoryValue, string>
  );

export function getCategoryBySlug(slug: string): QuestionCategoryValue | null {
  return QUESTION_CATEGORIES.find((label) => QUESTION_CATEGORY_SLUGS[label] === slug) ?? null;
}

// Bumped whenever the Privacy Policy content changes materially. Stored on
// each Creator record at signup time so we always know which version of the
// policy a given consent was given under (GDPR accountability requirement).
export const PRIVACY_POLICY_VERSION = "1.0";

// ISO-ish country list, kept intentionally broad for a global audience.
export const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahrain","Bangladesh","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Brazil","Bulgaria",
  "Cambodia","Cameroon","Canada","Chile","China","Colombia","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
  "Denmark","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Estonia","Ethiopia",
  "Finland","France",
  "Georgia","Germany","Ghana","Greece","Guatemala",
  "Honduras","Hong Kong","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kuwait",
  "Latvia","Lebanon","Lithuania","Luxembourg",
  "Malaysia","Malta","Mexico","Moldova","Mongolia","Montenegro","Morocco",
  "Nepal","Netherlands","New Zealand","Nigeria","North Macedonia","Norway",
  "Oman",
  "Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar",
  "Romania","Russia",
  "Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland",
  "Taiwan","Tanzania","Thailand","Tunisia","Turkey",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Venezuela","Vietnam",
  "Zimbabwe",
  "Other",
] as const;
