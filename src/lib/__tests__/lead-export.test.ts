import { describe, it, expect } from "vitest";
import { LEAD_CSV_HEADERS, buildLeadCsvRow, type LeadExportRecord } from "@/lib/lead-export";

function makeRecord(overrides: Partial<LeadExportRecord> = {}): LeadExportRecord {
  return {
    email: "jane@example.com",
    createdAt: new Date("2026-07-01T10:00:00.000Z"),
    emailVerifiedAt: new Date("2026-07-01T10:15:00.000Z"),
    status: "NEW",
    privacyAccepted: true,
    gdprConsentAt: new Date("2026-07-01T10:00:00.000Z"),
    privacyPolicyVersion: "1.0",
    utmSource: "newsletter",
    ...overrides,
  };
}

describe("LEAD_CSV_HEADERS", () => {
  it("has one header per row column", () => {
    expect(LEAD_CSV_HEADERS.length).toBe(8);
  });
});

describe("buildLeadCsvRow", () => {
  it("builds a fully-populated row in header order", () => {
    const row = buildLeadCsvRow(makeRecord());
    expect(row).toEqual([
      "jane@example.com",
      "2026-07-01T10:00:00.000Z",
      "verified",
      "NEW",
      "true",
      "2026-07-01T10:00:00.000Z",
      "1.0",
      "newsletter",
    ]);
    expect(row.length).toBe(LEAD_CSV_HEADERS.length);
  });

  it("reports pending verification when emailVerifiedAt is null", () => {
    const row = buildLeadCsvRow(makeRecord({ emailVerifiedAt: null }));
    expect(row[2]).toBe("pending");
  });

  it("reports false consent and blank audit fields when consent was not given", () => {
    const row = buildLeadCsvRow(
      makeRecord({ privacyAccepted: false, gdprConsentAt: null, privacyPolicyVersion: null })
    );
    expect(row[4]).toBe("false");
    expect(row[5]).toBe("");
    expect(row[6]).toBe("");
  });

  it("leaves UTM source blank when absent", () => {
    const row = buildLeadCsvRow(makeRecord({ utmSource: null }));
    expect(row[7]).toBe("");
  });
});
