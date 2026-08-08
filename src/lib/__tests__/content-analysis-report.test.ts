import { describe, it, expect } from "vitest";
import { buildReportResult, resolveReportAccess, type ReportAccessRecord } from "../content-analysis-report";
import type { NormalizedVideoMetadata } from "../video-providers/types";

function makeVideo(overrides: Partial<NormalizedVideoMetadata> = {}): NormalizedVideoMetadata {
  return {
    platform: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=abc12345678",
    externalId: "abc12345678",
    canonicalUrl: "https://www.youtube.com/watch?v=abc12345678",
    title: "A video",
    description: "Some description with a secret internal note",
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
    transcript: "some transcript text",
    captionsAvailable: true,
    ...overrides,
  };
}

function validRaw(videos = [makeVideo()]) {
  return JSON.stringify({
    isDemo: false,
    provider: "youtube-data-api-v3",
    fetchedAt: "2024-01-01T00:00:00Z",
    videos,
    failedUrls: [],
  });
}

describe("buildReportResult", () => {
  it("strips internal-only fields (provider id, description, transcript)", () => {
    const dto = buildReportResult(validRaw());
    expect(dto).not.toBeNull();
    const video = dto?.videos[0] as unknown as Record<string, unknown>;
    expect(video.description).toBeUndefined();
    expect(video.transcript).toBeUndefined();
    expect(dto).not.toHaveProperty("provider");
  });

  it("returns null for invalid raw input", () => {
    expect(buildReportResult("not json")).toBeNull();
    expect(buildReportResult(null)).toBeNull();
  });
});

describe("resolveReportAccess", () => {
  const owner = "anon-owner";
  const stranger = "anon-stranger";

  it("treats a missing record as not_found", () => {
    expect(resolveReportAccess(null, owner)).toEqual({ kind: "not_found" });
  });

  it("treats a record owned by a different anonymousId as not_found (IDOR)", () => {
    const record: ReportAccessRecord = {
      anonymousId: owner,
      status: "completed",
      result: validRaw(),
      errorMessage: null,
    };
    expect(resolveReportAccess(record, stranger)).toEqual({ kind: "not_found" });
  });

  it("returns queued/processing for non-terminal statuses owned by the caller", () => {
    const queued: ReportAccessRecord = { anonymousId: owner, status: "queued", result: null, errorMessage: null };
    const processing: ReportAccessRecord = {
      anonymousId: owner,
      status: "processing",
      result: null,
      errorMessage: null,
    };
    expect(resolveReportAccess(queued, owner)).toEqual({ kind: "queued" });
    expect(resolveReportAccess(processing, owner)).toEqual({ kind: "processing" });
  });

  it("returns failed with the stored error message", () => {
    const record: ReportAccessRecord = {
      anonymousId: owner,
      status: "failed",
      result: null,
      errorMessage: "We couldn't retrieve data for any of the submitted videos.",
    };
    expect(resolveReportAccess(record, owner)).toEqual({
      kind: "failed",
      errorMessage: "We couldn't retrieve data for any of the submitted videos.",
    });
  });

  it("returns completed_invalid when completed but the result JSON is invalid", () => {
    const record: ReportAccessRecord = {
      anonymousId: owner,
      status: "completed",
      result: "{not valid json",
      errorMessage: null,
    };
    expect(resolveReportAccess(record, owner)).toEqual({ kind: "completed_invalid" });
  });

  it("returns completed_invalid when completed but result is null", () => {
    const record: ReportAccessRecord = { anonymousId: owner, status: "completed", result: null, errorMessage: null };
    expect(resolveReportAccess(record, owner)).toEqual({ kind: "completed_invalid" });
  });

  it("returns completed with a parsed multi-video result for the owner", () => {
    const record: ReportAccessRecord = {
      anonymousId: owner,
      status: "completed",
      result: validRaw([makeVideo({ externalId: "v1" }), makeVideo({ externalId: "v2" })]),
      errorMessage: null,
    };
    const outcome = resolveReportAccess(record, owner);
    expect(outcome.kind).toBe("completed");
    if (outcome.kind === "completed") {
      expect(outcome.result.videos).toHaveLength(2);
    }
  });
});
