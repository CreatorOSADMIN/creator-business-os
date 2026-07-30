import { logger } from "@/lib/logger";

/**
 * Provider-agnostic incident/alerting hook, mirroring `lib/analytics.ts`'s
 * `registerAnalyticsProvider` pattern.
 *
 * No alerting vendor is wired up yet (PagerDuty, Slack webhook, Sentry
 * alert rule, etc. — out of scope here). `reportIncident` always logs via
 * the existing structured `logger` so every failure is captured today, and
 * gives call sites (health checks, signup) a single stable place to report
 * from. A real provider can be plugged in later via `registerAlertProvider`
 * with no changes needed at any call site.
 */

export type MonitoringEvent =
  | "health_check_failed"
  | "health_check_degraded"
  | "signup_failed"
  | "signup_email_failed"
  | "signup_cookie_failed";

export type MonitoringDetails = Record<string, unknown>;

type AlertProvider = (event: MonitoringEvent, details: MonitoringDetails) => void;

let provider: AlertProvider | null = null;

/** Wire up a real alerting vendor. Call once, e.g. from instrumentation.ts. */
export function registerAlertProvider(fn: AlertProvider): void {
  provider = fn;
}

/** Removes the current provider. Mainly useful for tests. */
export function resetAlertProvider(): void {
  provider = null;
}

/**
 * Records an incident: always logs via the structured logger, and forwards
 * to a registered alert provider if one is set. Never throws — a
 * misbehaving alert provider must not break the request it's monitoring.
 */
export function reportIncident(event: MonitoringEvent, details: MonitoringDetails = {}): void {
  logger.error(`monitoring: ${event}`, { scope: "monitoring", event, ...details });
  try {
    provider?.(event, details);
  } catch {
    // Alert delivery failures are not the caller's problem.
  }
}
