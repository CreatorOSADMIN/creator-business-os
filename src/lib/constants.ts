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
  NEW: "bg-neutral-200 text-neutral-800",
  VERIFIED: "bg-sky-100 text-sky-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-800",
  INTERESTED: "bg-amber-100 text-amber-800",
  BETA: "bg-teal-100 text-teal-800",
  CONVERTED: "bg-emerald-100 text-emerald-800",
  PAID: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

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
