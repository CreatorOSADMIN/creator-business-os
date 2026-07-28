export async function register() {
  // Fail loudly (but don't crash the process) if required env vars are
  // missing, so the problem is visible in Vercel/server logs immediately
  // instead of surfacing later as an opaque runtime error.
  const { validateEnvOrReport } = await import("@/lib/env");
  const check = validateEnvOrReport();
  if (!check.ok) {
    console.error(`[startup] Environment validation failed:\n${check.message}`);
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export async function onRequestError(
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
) {
  if (!process.env.SENTRY_DSN) return;
  const { captureRequestError } = await import("@sentry/nextjs");
  captureRequestError(...args);
}
