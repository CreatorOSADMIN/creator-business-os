/**
 * Provider-agnostic analytics tracking.
 *
 * No analytics provider is wired up yet (adding one, e.g. GA/Plausible/
 * PostHog, needs a NEXT_PUBLIC_* env var and a decision on which vendor —
 * out of scope here). This module gives the app a stable, typed surface to
 * call today, so instrumentation ships now and only the provider needs to
 * be plugged in later via `registerAnalyticsProvider`.
 *
 * Safe by design: `trackEvent` never throws, is a no-op without a
 * registered provider (besides a dev-only console hint), and does nothing
 * on the server (analytics is a client-side concern here).
 */

export type AnalyticsEvent =
  | "homepage_view"
  | "cta_click"
  | "early_access_click"
  | "early_access_form_open"
  | "early_access_form_start"
  | "early_access_form_submit"
  | "early_access_signup"
  | "email_verified";

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

type AnalyticsProvider = (event: AnalyticsEvent, props?: AnalyticsProps) => void;

let provider: AnalyticsProvider | null = null;

/** Wire up a real analytics vendor. Call once, e.g. from a client provider component. */
export function registerAnalyticsProvider(fn: AnalyticsProvider): void {
  provider = fn;
}

/** Removes the current provider. Mainly useful for tests. */
export function resetAnalyticsProvider(): void {
  provider = null;
}

export function trackEvent(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;
  try {
    if (provider) {
      provider(event, props);
    } else if (process.env.NODE_ENV !== "production") {
      console.debug(`[analytics] ${event}`, props ?? {});
    }
  } catch {
    // Analytics must never break the app.
  }
}
