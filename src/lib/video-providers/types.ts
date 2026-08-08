// Provider-independent contract for fetching real, public video metadata.
// ContentAnalysis business logic (the API route) depends only on this
// interface, never on a specific vendor (YouTube Data API, a third-party
// scraper, etc.) — see index.ts for how a platform is mapped to a provider.

import type { CaPlatform } from "@/lib/content-analysis";

/**
 * Normalized metadata for a single video, regardless of which provider or
 * platform it came from. Any field a provider cannot supply MUST be left
 * null/empty rather than guessed — callers rely on null meaning "unknown",
 * not "zero".
 */
export interface NormalizedVideoMetadata {
  platform: CaPlatform;
  /** The exact URL that was submitted, before any canonicalization. */
  sourceUrl: string;
  /** Platform-native id (e.g. YouTube video id). */
  externalId: string;
  /** Canonical, cleaned-up URL for this video. */
  canonicalUrl: string;

  title: string | null;
  description: string | null;
  authorName: string | null;
  authorHandle: string | null;
  thumbnailUrl: string | null;
  /** ISO 8601 timestamp. */
  publishedAt: string | null;
  durationSeconds: number | null;

  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;

  hashtags: string[];
  transcript: string | null;
  /** Whether captions/subtitles exist for this video, independent of
   * whether we were able to fetch their text as `transcript`. */
  captionsAvailable: boolean | null;
}

export type VideoFetchOutcome =
  | { ok: true; sourceUrl: string; metadata: NormalizedVideoMetadata }
  | { ok: false; sourceUrl: string; reason: string };

/**
 * A single real data source for one platform. Implementations must never
 * throw for an individual video failure — report it via a `{ ok: false }`
 * outcome instead — so one bad URL in a batch doesn't fail the whole
 * request. Throwing is reserved for provider-level failures (auth,
 * network, quota) that apply to the whole call.
 */
export interface VideoAnalysisProvider {
  /** Stable id persisted alongside results, e.g. "youtube-data-api-v3". */
  readonly id: string;
  readonly platform: CaPlatform;
  fetchVideos(urls: string[]): Promise<VideoFetchOutcome[]>;
}
