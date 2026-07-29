import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  trackEvent,
  registerAnalyticsProvider,
  resetAnalyticsProvider,
} from "@/lib/analytics";

// The test environment runs in node (no DOM), so `trackEvent` is a no-op
// unless `window` exists — simulate a browser context for these tests.
beforeEach(() => {
  (globalThis as unknown as { window: unknown }).window = {};
});

afterEach(() => {
  resetAnalyticsProvider();
  delete (globalThis as unknown as { window?: unknown }).window;
});

describe("trackEvent", () => {
  it("does nothing when window is undefined (server-side)", () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    const fn = vi.fn();
    registerAnalyticsProvider(fn);
    trackEvent("homepage_view");
    expect(fn).not.toHaveBeenCalled();
  });

  it("is a safe no-op with no provider registered", () => {
    expect(() => trackEvent("cta_click", { location: "hero" })).not.toThrow();
  });

  it("forwards the event and props to the registered provider", () => {
    const fn = vi.fn();
    registerAnalyticsProvider(fn);
    trackEvent("early_access_form_submit", { source: "test" });
    expect(fn).toHaveBeenCalledWith("early_access_form_submit", { source: "test" });
  });

  it("never throws even if the provider itself throws", () => {
    registerAnalyticsProvider(() => {
      throw new Error("provider exploded");
    });
    expect(() => trackEvent("email_verified")).not.toThrow();
  });
});
