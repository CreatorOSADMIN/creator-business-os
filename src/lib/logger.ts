/**
 * Minimal structured logger for server-side code.
 *
 * Emits single-line JSON to stdout/stderr (level, message, timestamp +
 * arbitrary fields) instead of ad-hoc `console.error("[tag] ...", err)`
 * calls, so logs are consistently parseable by any log aggregator
 * (Vercel logs, Datadog, CloudWatch, etc.) without further setup.
 *
 * Reuses the same redaction rule as `sentry-scrub.ts` so secrets/PII never
 * leave the process through this path either.
 */

type Level = "debug" | "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN = /pass|secret|token|cookie|authorization/i;

function redact(fields: LogFields | undefined): LogFields | undefined {
  if (!fields) return undefined;
  const clean: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    clean[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? "[Redacted]"
      : value instanceof Error
        ? { name: value.name, message: value.message }
        : value;
  }
  return clean;
}

function emit(level: Level, message: string, fields?: LogFields) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...redact(fields),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  /** Verbose, dev-only diagnostics. No-op in production. */
  debug(message: string, fields?: LogFields) {
    if (process.env.NODE_ENV !== "production") emit("debug", message, fields);
  },
  info(message: string, fields?: LogFields) {
    emit("info", message, fields);
  },
  warn(message: string, fields?: LogFields) {
    emit("warn", message, fields);
  },
  error(message: string, fields?: LogFields) {
    emit("error", message, fields);
  },
};
