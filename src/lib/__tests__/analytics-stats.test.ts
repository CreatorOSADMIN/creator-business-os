import { describe, it, expect } from "vitest";
import { computeGrowthSeries, countSince, conversionRate } from "@/lib/analytics-stats";

describe("computeGrowthSeries", () => {
  it("returns one bucket per day with no gaps, oldest first", () => {
    const now = new Date("2026-07-29T12:00:00Z");
    const series = computeGrowthSeries([], 7, now);
    expect(series).toHaveLength(7);
    expect(series[0].date).toBe("2026-07-23");
    expect(series[6].date).toBe("2026-07-29");
    expect(series.every((p) => p.count === 0)).toBe(true);
  });

  it("counts signups into their UTC day bucket", () => {
    const now = new Date("2026-07-29T12:00:00Z");
    const createdAt = [
      new Date("2026-07-29T01:00:00Z"),
      new Date("2026-07-29T23:00:00Z"),
      new Date("2026-07-28T10:00:00Z"),
    ];
    const series = computeGrowthSeries(createdAt, 7, now);
    expect(series.find((p) => p.date === "2026-07-29")?.count).toBe(2);
    expect(series.find((p) => p.date === "2026-07-28")?.count).toBe(1);
  });

  it("ignores signups outside the requested window", () => {
    const now = new Date("2026-07-29T12:00:00Z");
    const createdAt = [new Date("2026-06-01T00:00:00Z")];
    const series = computeGrowthSeries(createdAt, 7, now);
    expect(series.reduce((sum, p) => sum + p.count, 0)).toBe(0);
  });
});

describe("countSince", () => {
  it("counts only dates on or after the cutoff", () => {
    const since = new Date("2026-07-20T00:00:00Z");
    const dates = [new Date("2026-07-19T00:00:00Z"), new Date("2026-07-20T00:00:00Z"), new Date("2026-07-25T00:00:00Z")];
    expect(countSince(dates, since)).toBe(2);
  });
});

describe("conversionRate", () => {
  it("returns 0 when total is 0", () => {
    expect(conversionRate(0, 0)).toBe(0);
  });

  it("computes a percentage rounded to one decimal", () => {
    expect(conversionRate(1, 3)).toBe(33.3);
    expect(conversionRate(2, 4)).toBe(50);
  });
});
