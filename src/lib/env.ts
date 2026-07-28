import { z } from "zod";

/**
 * Centralized, fail-fast environment variable validation.
 *
 * Import `serverEnv` (server-only) or `publicEnv` (safe for the client
 * bundle) instead of reading `process.env` directly. Both throw a single,
 * clear error listing every missing/invalid variable the first time they
 * are accessed, instead of letting the app boot into a broken state that
 * only surfaces as a runtime error later (e.g. a 500 on first login).
 *
 * Never logs actual variable values — only names.
 */

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z.string().min(16, "SESSION_SECRET must be at least 16 characters"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email address"),
  ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD is required"),

  // EMAIL_PROVIDER=console (default) needs nothing else. EMAIL_PROVIDER=smtp
  // additionally needs credentials, but those are validated lazily in
  // src/lib/email.ts (SMTP_USER/SMTP_PASSWORD are valid alternatives to
  // EMAIL_USER/EMAIL_APP_PASSWORD there), so we only check shape here.
  EMAIL_PROVIDER: z.enum(["console", "smtp"]).default("console"),
  EMAIL_USER: z.string().optional(),
  EMAIL_APP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  SENTRY_DSN: z.string().url().optional().or(z.literal("")),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL"),
  NEXT_PUBLIC_GOFUNDME_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional().or(z.literal("")),
});

type ServerEnv = z.infer<typeof serverSchema>;
type PublicEnv = z.infer<typeof publicSchema>;

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

let cachedServerEnv: ServerEnv | null = null;
let cachedPublicEnv: PublicEnv | null = null;

/**
 * Validates and returns server-only environment variables. Throws with a
 * clear, secret-free message naming every missing/invalid variable.
 * Never call this from client components.
 */
export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Invalid or missing environment variables:\n${formatIssues(result.error)}\n\n` +
        "Check your .env file against .env.test.example / docs/EMAIL_ENV_VARS.md."
    );
  }
  cachedServerEnv = result.data;
  return cachedServerEnv;
}

/** Validates and returns public (NEXT_PUBLIC_*) environment variables. Safe to call from the client. */
export function getPublicEnv(): PublicEnv {
  if (cachedPublicEnv) return cachedPublicEnv;

  const result = publicSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GOFUNDME_URL: process.env.NEXT_PUBLIC_GOFUNDME_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
  if (!result.success) {
    throw new Error(
      `Invalid or missing public environment variables:\n${formatIssues(result.error)}`
    );
  }
  cachedPublicEnv = result.data;
  return cachedPublicEnv;
}

/** Only used by the startup check in instrumentation.ts — never throws, just reports. */
export function validateEnvOrReport(): { ok: true } | { ok: false; message: string } {
  try {
    getServerEnv();
    getPublicEnv();
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

/** Exposed for tests only. */
export const __private__ = { serverSchema, publicSchema };
