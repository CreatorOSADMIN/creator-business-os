import { describe, it, expect } from "vitest";
import { toCsv, toCsvValue } from "@/lib/csv";

describe("toCsvValue", () => {
  it("returns plain values unchanged", () => {
    expect(toCsvValue("hello@example.com")).toBe("hello@example.com");
  });

  it("quotes and escapes values containing commas, quotes, or newlines", () => {
    expect(toCsvValue("a,b")).toBe('"a,b"');
    expect(toCsvValue('say "hi"')).toBe('"say ""hi"""');
    expect(toCsvValue("line1\nline2")).toBe('"line1\nline2"');
  });
});

describe("toCsv", () => {
  it("builds a header row plus data rows joined with CRLF", () => {
    const csv = toCsv(
      ["email", "signup_date", "verification_status"],
      [
        ["a@example.com", "2026-07-01T00:00:00.000Z", "verified"],
        ["b@example.com", "2026-07-02T00:00:00.000Z", "pending"],
      ]
    );
    expect(csv).toBe(
      "email,signup_date,verification_status\r\n" +
        "a@example.com,2026-07-01T00:00:00.000Z,verified\r\n" +
        "b@example.com,2026-07-02T00:00:00.000Z,pending"
    );
  });
});
