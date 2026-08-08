// Turns the internally-persisted provider result into the narrower shape
// the client report is allowed to see, and centralizes the
// ownership/status decision used by GET /api/content-analysis/[id] so it
// can be unit tested without mocking prisma or next/headers.

import { parsePersistedContentAnalysisResult } from "@/lib/content-analysis-result";
import type { CaPlatform } from "@/lib/content-analysis";

export interface ContentAnalysisReportVideo {
  platform: CaPlatform;
  sourceUrl: string;
  externalId: string;
  canonicalUrl: string;
  title: string | null;
  authorName: string | null;
  authorHandle: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  durationSeconds: number | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  hashtags: string[];
}

export interface ContentAnalysisReportResult {
  fetchedAt: string;
  videos: ContentAnalysisReportVideo[];
  failedUrls: { url: string; reason: string }[];
}

/**
 * Parses the raw persisted string and strips it down to only what the
 * report needs — no provider id, no description/transcript text, no
 * internal fields. Returns null for anything invalid (see
 * parsePersistedContentAnalysisResult) so a bad payload never reaches the
 * client as if it were a real result.
 */
export function buildReportResult(
  raw: string | null | undefined
): ContentAnalysisReportResult | null {
  const parsed = parsePersistedContentAnalysisResult(raw);
  if (!parsed) return null;

  return {
    fetchedAt: parsed.fetchedAt,
    videos: parsed.videos.map((v) => ({
      platform: v.platform,
      sourceUrl: v.sourceUrl,
      externalId: v.externalId,
      canonicalUrl: v.canonicalUrl,
      title: v.title,
      authorName: v.authorName,
      authorHandle: v.authorHandle,
      thumbnailUrl: v.thumbnailUrl,
      publishedAt: v.publishedAt,
      durationSeconds: v.durationSeconds,
      views: v.views,
      likes: v.likes,
      comments: v.comments,
      shares: v.shares,
      hashtags: v.hashtags,
    })),
    failedUrls: parsed.failedUrls,
  };
}

export interface ReportAccessRecord {
  anonymousId: string | null;
  status: string;
  result: string | null;
  errorMessage: string | null;
}

export type ReportAccessOutcome =
  | { kind: "not_found" }
  | { kind: "queued" }
  | { kind: "processing" }
  | { kind: "failed"; errorMessage: string | null }
  | { kind: "completed_invalid" }
  | { kind: "completed"; result: ContentAnalysisReportResult };

/**
 * Single source of truth for "can this visitor see this analysis, and
 * what should they see". A missing record and one owned by a different
 * anonymous visitor both resolve to `not_found` — same as the existing
 * GET /api/content-analysis/[id] behavior — so ownership can never be
 * probed by trying different ids.
 */
export function resolveReportAccess(
  record: ReportAccessRecord | null,
  requestingAnonymousId: string
): ReportAccessOutcome {
  if (!record || record.anonymousId !== requestingAnonymousId) {
    return { kind: "not_found" };
  }

  if (record.status === "failed") {
    return { kind: "failed", errorMessage: record.errorMessage };
  }

  if (record.status !== "completed") {
    return record.status === "processing" ? { kind: "processing" } : { kind: "queued" };
  }

  const result = buildReportResult(record.result);
  if (!result) return { kind: "completed_invalid" };

  return { kind: "completed", result };
}
