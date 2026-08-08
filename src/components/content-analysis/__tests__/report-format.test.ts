import { describe, it, expect } from "vitest";
import { formatAnalyzedAt, formatCompactNumber, formatDuration, formatPublishedDate } from "../report-format";

describe("formatCompactNumber", () => {
  it("returns null for null input", () => {
    expect(formatCompactNumber(null)).toBeNull();
  });

  it("compacts large numbers", () => {
    expect(formatCompactNumber(1500)).toBe("1.5K");
    expect(formatCompactNumber(2_300_000)).toBe("2.3M");
  });

  it("passes through small numbers", () => {
    expect(formatCompactNumber(42)).toBe("42");
    expect(formatCompactNumber(0)).toBe("0");
  });
});

describe("formatDuration", () => {
  it("returns null for null or negative input", () => {
    expect(formatDuration(null)).toBeNull();
    expect(formatDuration(-5)).toBeNull();
  });

  it("formats seconds under an hour as m:ss", () => {
    expect(formatDuration(45)).toBe("0:45");
    expect(formatDuration(125)).toBe("2:05");
  });

  it("formats an hour or more as h:mm:ss", () => {
    expect(formatDuration(3723)).toBe("1:02:03");
  });
});

describe("formatPublishedDate", () => {
  it("returns null for null or invalid input", () => {
    expect(formatPublishedDate(null)).toBeNull();
    expect(formatPublishedDate("not a date")).toBeNull();
  });

  it("formats a valid ISO timestamp", () => {
    expect(formatPublishedDate("2024-03-15T00:00:00Z")).toBe("Mar 15, 2024");
  });
});

describe("formatAnalyzedAt", () => {
  it("returns null for null or invalid input", () => {
    expect(formatAnalyzedAt(null)).toBeNull();
    expect(formatAnalyzedAt("not a date")).toBeNull();
  });

  it("formats a valid ISO timestamp including the time", () => {
    const result = formatAnalyzedAt("2024-03-15T14:30:00Z");
    expect(result).toContain("Mar 15, 2024");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});
