import { describe, it, expect, beforeEach, vi } from "vitest";

const REQUIRED_ENV = {
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  SESSION_SECRET: "a-secret-that-is-long-enough",
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD: "hunter2",
  NEXT_PUBLIC_SITE_URL: "https://example.com",
};

async function loadEnvModule() {
  vi.resetModules();
  return import("@/lib/env");
}

describe("getServerEnv / getPublicEnv", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  it("parses successfully when all required variables are present", async () => {
    Object.assign(process.env, REQUIRED_ENV);
    const { getServerEnv, getPublicEnv } = await loadEnvModule();

    expect(getServerEnv().DATABASE_URL).toBe(REQUIRED_ENV.DATABASE_URL);
    expect(getPublicEnv().NEXT_PUBLIC_SITE_URL).toBe(REQUIRED_ENV.NEXT_PUBLIC_SITE_URL);
  });

  it("throws a clear error naming the missing variable", async () => {
    Object.assign(process.env, REQUIRED_ENV);
    delete process.env.SESSION_SECRET;
    const { getServerEnv } = await loadEnvModule();

    expect(() => getServerEnv()).toThrow(/SESSION_SECRET/);
  });

  it("rejects a SESSION_SECRET that is too short", async () => {
    Object.assign(process.env, REQUIRED_ENV, { SESSION_SECRET: "short" });
    const { getServerEnv } = await loadEnvModule();

    expect(() => getServerEnv()).toThrow(/SESSION_SECRET/);
  });

  it("rejects an invalid ADMIN_EMAIL", async () => {
    Object.assign(process.env, REQUIRED_ENV, { ADMIN_EMAIL: "not-an-email" });
    const { getServerEnv } = await loadEnvModule();

    expect(() => getServerEnv()).toThrow(/ADMIN_EMAIL/);
  });

  it("never includes actual secret values in the thrown message", async () => {
    Object.assign(process.env, REQUIRED_ENV, { SESSION_SECRET: "short" });
    const { getServerEnv } = await loadEnvModule();

    try {
      getServerEnv();
      throw new Error("expected getServerEnv to throw");
    } catch (err) {
      expect(String(err)).not.toContain("short");
    }
  });

  it("validateEnvOrReport reports failure without throwing", async () => {
    Object.assign(process.env, REQUIRED_ENV);
    delete process.env.DATABASE_URL;
    const { validateEnvOrReport } = await loadEnvModule();

    const result = validateEnvOrReport();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/DATABASE_URL/);
  });
});
