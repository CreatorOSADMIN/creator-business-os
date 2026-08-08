import { describe, it, expect } from "vitest";
import { extractYoutubeVideoId, parseIso8601Duration } from "../video-providers/youtube-provider";

describe("extractYoutubeVideoId", () => {
  it("parses a standard watch URL", () => {
    expect(extractYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("parses a youtu.be short link", () => {
    expect(extractYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("parses a shorts URL", () => {
    expect(extractYoutubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("parses a watch URL with extra query params", () => {
    expect(extractYoutubeVideoId("https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for a non-YouTube URL", () => {
    expect(extractYoutubeVideoId("https://tiktok.com/@a/video/123")).toBeNull();
  });

  it("returns null for an unparseable/invalid id", () => {
    expect(extractYoutubeVideoId("https://www.youtube.com/watch?v=short")).toBeNull();
  });

  it("returns null for a malformed URL", () => {
    expect(extractYoutubeVideoId("not a url")).toBeNull();
  });
});

describe("parseIso8601Duration", () => {
  it("parses hours, minutes, and seconds", () => {
    expect(parseIso8601Duration("PT1H2M3S")).toBe(3723);
  });

  it("parses minutes-only durations", () => {
    expect(parseIso8601Duration("PT4M13S")).toBe(253);
  });

  it("parses seconds-only durations", () => {
    expect(parseIso8601Duration("PT45S")).toBe(45);
  });

  it("returns null for an invalid format", () => {
    expect(parseIso8601Duration("garbage")).toBeNull();
  });
});
