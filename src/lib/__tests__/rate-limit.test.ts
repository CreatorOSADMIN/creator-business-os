import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const key = `test-${Math.random()}`;
    const result = rateLimit(key, { limit: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests once the limit is exceeded", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, { limit: 2, windowMs: 60_000 });
    rateLimit(key, { limit: 2, windowMs: 60_000 });
    const third = rateLimit(key, { limit: 2, windowMs: 60_000 });
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets the bucket after the window expires", () => {
    vi.useFakeTimers();
    const key = `test-${Math.random()}`;
    rateLimit(key, { limit: 1, windowMs: 1000 });
    expect(rateLimit(key, { limit: 1, windowMs: 1000 }).allowed).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(rateLimit(key, { limit: 1, windowMs: 1000 }).allowed).toBe(true);
    vi.useRealTimers();
  });
});

describe("getClientIp", () => {
  it("prefers x-forwarded-for, taking the first address", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(getClientIp(headers)).toBe("9.9.9.9");
  });

  it("falls back to 'unknown' with no headers", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
