import { describe, it, expect } from "vitest";
import { isSafeHttpUrl } from "../safe-url";

describe("isSafeHttpUrl", () => {
  it("accepts https and http URLs", () => {
    expect(isSafeHttpUrl("https://example.com/video")).toBe(true);
    expect(isSafeHttpUrl("http://example.com/video")).toBe(true);
  });

  it("rejects javascript: and data: URLs", () => {
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("rejects null, undefined, and empty strings", () => {
    expect(isSafeHttpUrl(null)).toBe(false);
    expect(isSafeHttpUrl(undefined)).toBe(false);
    expect(isSafeHttpUrl("")).toBe(false);
  });

  it("rejects malformed URLs", () => {
    expect(isSafeHttpUrl("not a url")).toBe(false);
  });
});
