// Real metadata provider backed by the official YouTube Data API v3
// (server-side API key, no OAuth/login from the creator required).
//
// Chosen for the first real provider integration because, unlike TikTok
// and Instagram, it exposes public video metadata through a first-party,
// free-tier, commercial-use-compatible REST API (videos.list costs 1
// quota unit per call and accepts up to 50 ids batched together, against
// a default 10,000 unit/day project quota) — see PATCH 5 notes in the
// repo root for the research this was based on.
//
// Known limitations (do not claim more than this actually returns):
//   - No transcript text: downloading caption tracks requires OAuth as
//     the video owner, which is not available for an arbitrary public
//     video. `captionsAvailable` reflects the public
//     contentDetails.caption flag; `transcript` is always null.
//   - `shares` is not exposed by the API at all; always null.
//   - `authorHandle` (the @handle) is not returned by videos.list; only
//     the display channel title is available, so it's used for both
//     authorName and left null for authorHandle.
//   - `hashtags` are parsed from the video description text (YouTube
//     doesn't return a separate hashtag list for videos.list).

import type { NormalizedVideoMetadata, VideoAnalysisProvider, VideoFetchOutcome } from "@/lib/video-providers/types";

const API_BASE = "https://www.googleapis.com/youtube/v3/videos";
// videos.list accepts up to 50 comma-separated ids per call; well above
// CONTENT_ANALYSIS_MAX_URLS (10), so a whole submission is always one call.
const MAX_IDS_PER_CALL = 50;

/** Extracts the 11-character video id from any common YouTube URL shape. */
export function extractYoutubeVideoId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const idPattern = /^[\w-]{11}$/;

  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    return idPattern.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (parsed.pathname === "/watch") {
      const id = parsed.searchParams.get("v") ?? "";
      return idPattern.test(id) ? id : null;
    }
    const segments = parsed.pathname.split("/").filter(Boolean);
    if ((segments[0] === "shorts" || segments[0] === "embed" || segments[0] === "live") && segments[1]) {
      return idPattern.test(segments[1]) ? segments[1] : null;
    }
  }

  return null;
}

/** Parses an ISO 8601 duration (e.g. "PT1H2M3S") into whole seconds. */
export function parseIso8601Duration(value: string): number | null {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function extractHashtags(description: string | null | undefined): string[] {
  if (!description) return [];
  const matches = description.match(/#[\w]+/g) ?? [];
  // De-duplicate while preserving first-seen order.
  return [...new Set(matches.map((tag) => tag.slice(1)))];
}

function toNumberOrNull(value: string | undefined): number | null {
  if (value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

interface YoutubeVideosListItem {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: Record<string, { url?: string }>;
  };
  contentDetails?: {
    duration?: string;
    caption?: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

function toNormalized(sourceUrl: string, id: string, item: YoutubeVideosListItem): NormalizedVideoMetadata {
  const snippet = item.snippet ?? {};
  const thumbnail =
    snippet.thumbnails?.maxres?.url ??
    snippet.thumbnails?.high?.url ??
    snippet.thumbnails?.medium?.url ??
    snippet.thumbnails?.default?.url ??
    null;

  return {
    platform: "YouTube",
    sourceUrl,
    externalId: id,
    canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
    title: snippet.title ?? null,
    description: snippet.description ?? null,
    authorName: snippet.channelTitle ?? null,
    authorHandle: null,
    thumbnailUrl: thumbnail,
    publishedAt: snippet.publishedAt ?? null,
    durationSeconds: item.contentDetails?.duration
      ? parseIso8601Duration(item.contentDetails.duration)
      : null,
    views: toNumberOrNull(item.statistics?.viewCount),
    likes: toNumberOrNull(item.statistics?.likeCount),
    comments: toNumberOrNull(item.statistics?.commentCount),
    shares: null,
    hashtags: extractHashtags(snippet.description),
    transcript: null,
    captionsAvailable: item.contentDetails?.caption === undefined ? null : item.contentDetails.caption === "true",
  };
}

export function createYoutubeProvider(apiKey: string): VideoAnalysisProvider {
  return {
    id: "youtube-data-api-v3",
    platform: "YouTube",

    async fetchVideos(urls: string[]): Promise<VideoFetchOutcome[]> {
      // Map each submitted URL to an id, splitting out ones we can't even
      // parse so they come back as a normal per-video failure instead of
      // breaking the batch.
      const idByUrl = new Map<string, string | null>();
      for (const url of urls) idByUrl.set(url, extractYoutubeVideoId(url));

      const validIds = [...new Set([...idByUrl.values()].filter((id): id is string => id !== null))].slice(
        0,
        MAX_IDS_PER_CALL
      );

      const itemsById = new Map<string, YoutubeVideosListItem>();
      if (validIds.length > 0) {
        const endpoint = new URL(API_BASE);
        endpoint.searchParams.set("part", "snippet,contentDetails,statistics");
        endpoint.searchParams.set("id", validIds.join(","));
        endpoint.searchParams.set("key", apiKey);

        const res = await fetch(endpoint.toString(), { method: "GET" });
        if (!res.ok) {
          // A provider-level failure (bad key, quota exceeded, network) —
          // let the caller treat the whole request as failed rather than
          // silently reporting every video as "not found".
          throw new Error(`YouTube Data API request failed with status ${res.status}`);
        }
        const data = (await res.json()) as { items?: YoutubeVideosListItem[] };
        for (const item of data.items ?? []) {
          itemsById.set(item.id, item);
        }
      }

      return urls.map((sourceUrl): VideoFetchOutcome => {
        const id = idByUrl.get(sourceUrl) ?? null;
        if (!id) {
          return { ok: false, sourceUrl, reason: "Could not parse a video id from this URL." };
        }
        const item = itemsById.get(id);
        if (!item) {
          return { ok: false, sourceUrl, reason: "Video not found, private, or unavailable." };
        }
        return { ok: true, sourceUrl, metadata: toNormalized(sourceUrl, id, item) };
      });
    },
  };
}
