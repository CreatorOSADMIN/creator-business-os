import { describe, it, expect, vi } from "vitest";

// computeEarlyAccessProgress is pure, but the module also imports prisma at
// the top level for getVerifiedCreatorsCount — mock it so this file doesn't
// need a generated Prisma client to test the pure function.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import {
  computeEarlyAccessProgress,
  EARLY_ACCESS_BASE_PERCENT,
  EARLY_ACCESS_GOAL,
} from "@/lib/early-access-progress";

describe("computeEarlyAccessProgress", () => {
  it("returns the base percentage with 0 verified users", () => {
    expect(computeEarlyAccessProgress(0)).toBe(EARLY_ACCESS_BASE_PERCENT);
  });

  it("returns a partial value with 500 verified users", () => {
    const result = computeEarlyAccessProgress(500);
    expect(result).toBeCloseTo(23 + (500 / EARLY_ACCESS_GOAL) * 77, 5);
    expect(result).toBeGreaterThan(EARLY_ACCESS_BASE_PERCENT);
    expect(result).toBeLessThan(100);
  });

  it("returns 100 at exactly the goal (1000 verified users)", () => {
    expect(computeEarlyAccessProgress(EARLY_ACCESS_GOAL)).toBe(100);
  });

  it("caps at 100 beyond the goal", () => {
    expect(computeEarlyAccessProgress(EARLY_ACCESS_GOAL + 500)).toBe(100);
  });
});
