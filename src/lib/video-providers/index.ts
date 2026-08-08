// Single lookup point from a CaPlatform to its real VideoAnalysisProvider.
// The API route depends only on this function + the VideoAnalysisProvider
// interface — it never imports a vendor-specific provider directly, and the
// client never chooses or sees which provider/vendor is used.

import type { CaPlatform } from "@/lib/content-analysis";
import type { VideoAnalysisProvider } from "@/lib/video-providers/types";
import { createYoutubeProvider } from "@/lib/video-providers/youtube-provider";
import { getServerEnv } from "@/lib/env";

/**
 * Returns the configured provider for a platform, or null if no real
 * provider is available yet (unimplemented platform, e.g. TikTok/
 * Instagram in this patch) or the provider's API key isn't configured.
 * Callers must treat null as "cannot run a real analysis right now" and
 * must never fall back to fabricated data.
 */
export function getVideoAnalysisProvider(platform: CaPlatform): VideoAnalysisProvider | null {
  switch (platform) {
    case "YouTube": {
      const apiKey = getServerEnv().YOUTUBE_API_KEY;
      if (!apiKey) return null;
      return createYoutubeProvider(apiKey);
    }
    // TikTok and Instagram don't yet have a real provider wired up — no
    // official API accepts an arbitrary public video URL without the
    // creator logging in via OAuth, so a later patch will need a
    // third-party scraper isolated behind this same interface.
    case "TikTok":
    case "Instagram":
      return null;
    default:
      return null;
  }
}

export type { VideoAnalysisProvider, NormalizedVideoMetadata, VideoFetchOutcome } from "@/lib/video-providers/types";
