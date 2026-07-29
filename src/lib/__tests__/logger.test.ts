import { describe, it, expect, vi, afterEach } from "vitest";
import { logger } from "@/lib/logger";

function lastCallJson(spy: ReturnType<typeof vi.spyOn>) {
  const line = spy.mock.calls.at(-1)?.[0] as string;
  return JSON.parse(line);
}

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits structured JSON with level, message and timestamp", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("something broke", { scope: "test" });

    const parsed = lastCallJson(spy);
    expect(parsed.level).toBe("error");
    expect(parsed.message).toBe("something broke");
    expect(parsed.scope).toBe("test");
    expect(typeof parsed.time).toBe("string");
  });

  it("routes warn/info/error to matching console methods", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.warn("careful");
    logger.info("fyi");

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it("redacts keys that look like secrets", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("auth failed", { password: "hunter2", token: "abc", userId: "u1" });

    const parsed = lastCallJson(spy);
    expect(parsed.password).toBe("[Redacted]");
    expect(parsed.token).toBe("[Redacted]");
    expect(parsed.userId).toBe("u1");
  });

  it("serializes Error fields to name/message instead of dumping the whole object", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("db failed", { err: new Error("boom") });

    const parsed = lastCallJson(spy);
    expect(parsed.err).toEqual({ name: "Error", message: "boom" });
  });
});
