import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Redacts anything that could carry secrets or personal data before an
 * event leaves the process. Applied on every Sentry config (server, edge,
 * client) so no code path can accidentally report it.
 *
 * Removed: cookies/headers (session tokens), request body (registration
 * form PII), user object (email/IP), and any key that looks like a
 * password/token/secret anywhere in extra/context data.
 */
const SENSITIVE_KEY_PATTERN = /pass|secret|token|cookie|authorization/i;

function scrubObject<T extends Record<string, unknown>>(obj: T | undefined): T | undefined {
  if (!obj) return obj;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    clean[key] = SENSITIVE_KEY_PATTERN.test(key) ? "[Redacted]" : value;
  }
  return clean as T;
}

export function sentryBeforeSend(event: ErrorEvent): ErrorEvent | null {
  // Never send the authenticated user identity or IP.
  delete event.user;

  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.data;
  }

  event.extra = scrubObject(event.extra);
  event.contexts = event.contexts
    ? (Object.fromEntries(
        Object.entries(event.contexts).map(([key, value]) => [
          key,
          scrubObject(value as Record<string, unknown> | undefined),
        ])
      ) as ErrorEvent["contexts"])
    : event.contexts;

  return event;
}
