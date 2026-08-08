// Type-safe, defensive parsing of ContentAnalysis.result (a JSON-encoded
// string column — see prisma/schema.prisma). The value is produced by
// runProviderAnalysis in the create route and must match the shape
// documented there, but since it round-trips through a plain string
// column nothing prevents it from being missing, malformed, or stale
// (e.g. written by a future/older patch) — so every field is validated
// before use rather than trusted.

import type { CaPlatform } from "@/lib/content-analysis";
import type { NormalizedVideoMetadata } from "@/lib/video-providers/types";

export interface PersistedContentAnalysisResult {
  isDemo: false;
  provider: string;
  fetchedAt: string;
  videos: NormalizedVideoMetadata[];
  failedUrls: { url: string; reason: string }[];
}

function isNullableString(v: unknown): v is string | null {
  return v === null || typeof v === "string";
}

function isNullableFiniteNumber(v: unknown): v is number | null {
  return v === null || (typeof v === "number" && Number.isFinite(v));
}

function isCaPlatform(v: unknown): v is CaPlatform {
  return v === "TikTok" || v === "Instagram" || v === "YouTube";
}

function isNormalizedVideoMetadata(v: unknown): v is NormalizedVideoMetadata {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;

  return (
    isCaPlatform(o.platform) &&
    typeof o.sourceUrl === "string" &&
    typeof o.externalId === "string" &&
    typeof o.canonicalUrl === "string" &&
    isNullableString(o.title) &&
    isNullableString(o.description) &&
    isNullableString(o.authorName) &&
    isNullableString(o.authorHandle) &&
    isNullableString(o.thumbnailUrl) &&
    isNullableString(o.publishedAt) &&
    isNullableFiniteNumber(o.durationSeconds) &&
    isNullableFiniteNumber(o.views) &&
    isNullableFiniteNumber(o.likes) &&
    isNullableFiniteNumber(o.comments) &&
    isNullableFiniteNumber(o.shares) &&
    Array.isArray(o.hashtags) &&
    o.hashtags.every((h) => typeof h === "string") &&
    isNullableString(o.transcript) &&
    (o.captionsAvailable === null || typeof o.captionsAvailable === "boolean")
  );
}

function isFailedUrl(v: unknown): v is { url: string; reason: string } {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.url === "string" && typeof o.reason === "string";
}

/**
 * Parses and validates the raw `ContentAnalysis.result` string. Returns
 * null for anything that isn't exactly the expected real-result shape —
 * missing value, invalid JSON, wrong types, or a demo-shaped payload
 * (`isDemo !== false`) — so callers never have to guess and never crash
 * rendering a report.
 */
export function parsePersistedContentAnalysisResult(
  raw: string | null | undefined
): PersistedContentAnalysisResult | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;
  const o = parsed as Record<string, unknown>;

  if (o.isDemo !== false) return null;
  if (typeof o.provider !== "string" || o.provider.length === 0) return null;
  if (typeof o.fetchedAt !== "string") return null;
  if (!Array.isArray(o.videos) || !o.videos.every(isNormalizedVideoMetadata)) return null;
  if (!Array.isArray(o.failedUrls) || !o.failedUrls.every(isFailedUrl)) return null;
  // A completed analysis always has at least one real video (see
  // runProviderAnalysis: zero successes forces status "failed" instead) —
  // treat a payload without any as invalid rather than rendering an empty
  // report.
  if (o.videos.length === 0) return null;

  return {
    isDemo: false,
    provider: o.provider,
    fetchedAt: o.fetchedAt,
    videos: o.videos,
    failedUrls: o.failedUrls,
  };
}
