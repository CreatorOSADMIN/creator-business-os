// Frontend-only helpers for the Content Analysis demo flow. No backend, no
// API calls, no persistence beyond sessionStorage — everything here just
// shapes and validates data that stays in the browser.

export const CA_PLATFORMS = ["TikTok", "Instagram", "YouTube"] as const;
export type CaPlatform = (typeof CA_PLATFORMS)[number];

export const CA_GOALS = [
  "Maximize Views",
  "Gain Followers",
  "Increase Comments",
  "Improve Engagement",
] as const;
export type CaGoal = (typeof CA_GOALS)[number];

export const CA_MAX_URLS = 10;

// Format-only checks — no external verification, no network requests.
const PLATFORM_URL_PATTERNS: Record<CaPlatform, RegExp> = {
  TikTok: /^https?:\/\/([\w-]+\.)?(tiktok\.com)\/.+/i,
  Instagram: /^https?:\/\/([\w-]+\.)?(instagram\.com)\/.+/i,
  YouTube: /^https?:\/\/([\w-]+\.)?(youtube\.com|youtu\.be)\/.+/i,
};

export function isValidPlatformUrl(url: string, platform: CaPlatform | ""): boolean {
  const trimmed = url.trim();
  if (!platform || !trimmed) return false;

  try {
    // eslint-disable-next-line no-new
    new URL(trimmed);
  } catch {
    return false;
  }

  return PLATFORM_URL_PATTERNS[platform].test(trimmed);
}

export interface ContentAnalysisSession {
  platform: CaPlatform;
  goal: CaGoal;
  videos: string[];
  createdAt: string;
}

export function buildDemoSession(
  platform: CaPlatform,
  goal: CaGoal,
  videos: string[]
): ContentAnalysisSession {
  return { platform, goal, videos, createdAt: new Date().toISOString() };
}

// Session-only handoff to the simulated loading + report pages. Nothing is
// sent anywhere — this is purely a frontend demo, no backend involved.
export const CA_DEMO_STORAGE_KEY = "creatoros:content-analysis-demo";
