import { describe, it, expect } from "vitest";
import { parsePersistedContentAnalysisResult } from "../content-analysis-result";
import type { NormalizedVideoMetadata } from "../video-providers/types";

function makeVideo(overrides: Partial<NormalizedVideoMetadata> = {}): NormalizedVideoMetadata {
  return {
    platform: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=abc12345678",
    externalId: "abc12345678",
    canonicalUrl: "https://www.youtube.com/watch?v=abc12345678",
    title: "A video",
    description: null,
    authorName: "A creator",
    authorHandle: null,
    thumbnailUrl: "https://i.ytimg.com/vi/abc12345678/hqdefault.jpg",
    publishedAt: "2024-01-01T00:00:00Z",
    durationSeconds: 42,
    views: 1000,
    likes: 50,
    comments: 5,
    shares: null,
    hashtags: ["fyp"],
    transcript: null,
    captionsAvailable: true,
    ...overrides,
  };
}

function validPayload(videos = [makeVideo()], failedUrls: { url: string; reason: string }[] = []) {
  return JSON.stringify({
    isDemo: false,
    provider: "youtube-data-api-v3",
    fetchedAt: "2024-01-01T00:00:00Z",
    videos,
    failedUrls,
  });
}

describe("parsePersistedContentAnalysisResult", () => {
  it("parses a valid single-video payload", () => {
    const result = parsePersistedContentAnalysisResult(validPayload());
    expect(result).not.toBeNull();
    expect(result?.videos).toHaveLength(1);
    expect(result?.videos[0].title).toBe("A video");
  });

  it("parses multiple videos and partial failures", () => {
    const raw = validPayload(
      [makeVideo({ externalId: "vid1" }), makeVideo({ externalId: "vid2", title: "Second" })],
      [{ url: "https://youtube.com/watch?v=bad", reason: "Video not found, private, or unavailable." }]
    );
    const result = parsePersistedContentAnalysisResult(raw);
    expect(result?.videos).toHaveLength(2);
    expect(result?.failedUrls).toHaveLength(1);
    expect(result?.failedUrls[0].reason).toContain("not found");
  });

  it("returns null for missing/empty input", () => {
    expect(parsePersistedContentAnalysisResult(null)).toBeNull();
    expect(parsePersistedContentAnalysisResult(undefined)).toBeNull();
    expect(parsePersistedContentAnalysisResult("")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parsePersistedContentAnalysisResult("{not json")).toBeNull();
  });

  it("returns null when isDemo is not exactly false", () => {
    const raw = JSON.stringify({
      isDemo: true,
      provider: "x",
      fetchedAt: "2024-01-01T00:00:00Z",
      videos: [makeVideo()],
      failedUrls: [],
    });
    expect(parsePersistedContentAnalysisResult(raw)).toBeNull();
  });

  it("returns null when videos is missing or has an invalid item", () => {
    const missingVideos = JSON.stringify({
      isDemo: false,
      provider: "x",
      fetchedAt: "2024-01-01T00:00:00Z",
      failedUrls: [],
    });
    expect(parsePersistedContentAnalysisResult(missingVideos)).toBeNull();

    const badVideo = validPayload([{ title: "missing required fields" } as unknown as NormalizedVideoMetadata]);
    expect(parsePersistedContentAnalysisResult(badVideo)).toBeNull();
  });

  it("returns null when videos is an empty array", () => {
    expect(parsePersistedContentAnalysisResult(validPayload([]))).toBeNull();
  });

  it("returns null when failedUrls has a malformed entry", () => {
    const raw = JSON.stringify({
      isDemo: false,
      provider: "x",
      fetchedAt: "2024-01-01T00:00:00Z",
      videos: [makeVideo()],
      failedUrls: [{ url: "https://x.com/1" }],
    });
    expect(parsePersistedContentAnalysisResult(raw)).toBeNull();
  });

  it("returns null for a top-level array or primitive", () => {
    expect(parsePersistedContentAnalysisResult("[]")).toBeNull();
    expect(parsePersistedContentAnalysisResult('"just a string"')).toBeNull();
  });
});
