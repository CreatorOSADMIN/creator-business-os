import { describe, it, expect, beforeEach } from "vitest";
import { createHmac } from "crypto";

const REQUIRED_ENV = {
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  SESSION_SECRET: "a-secret-that-is-long-enough",
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD: "hunter2",
  NEXT_PUBLIC_SITE_URL: "https://example.com",
};

describe("hashIp", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv, ...REQUIRED_ENV };
  });

  it("produces a deterministic HMAC-SHA256 hex digest keyed with SESSION_SECRET", async () => {
    const { hashIp } = await import("@/lib/ip-hash");
    expect(hashIp("203.0.113.7")).toBe(
      createHmac("sha256", REQUIRED_ENV.SESSION_SECRET).update("203.0.113.7").digest("hex")
    );
  });

  it("hashes the same IPv4 address the same way twice", async () => {
    const { hashIp } = await import("@/lib/ip-hash");
    expect(hashIp("198.51.100.23")).toBe(hashIp("198.51.100.23"));
  });

  it("hashes different IPs to different values", async () => {
    const { hashIp } = await import("@/lib/ip-hash");
    expect(hashIp("198.51.100.23")).not.toBe(hashIp("198.51.100.24"));
  });

  it("normalizes IPv6 case and zone id so equivalent addresses match", async () => {
    const { hashIp } = await import("@/lib/ip-hash");
    expect(hashIp("FE80::1FF:FE23:4567:890A%eth0")).toBe(hashIp("fe80::1ff:fe23:4567:890a"));
  });

  it("hashes a full IPv6 address without error", async () => {
    const { hashIp } = await import("@/lib/ip-hash");
    expect(hashIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toHaveLength(64);
  });
});
