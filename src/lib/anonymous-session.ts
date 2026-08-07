import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE_NAME = "creatoros_anon_id";
// Long-lived so a returning anonymous visitor keeps the same identity (and
// therefore the same free-analysis allowance) across sessions. Only an
// opaque random id is stored — never the usage count, which stays
// server-authoritative and is derived from persisted ContentAnalysis rows.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Returns the anonymous visitor id for this browser, creating and
 * persisting one via a first-party cookie if none exists yet. Entirely
 * independent of the registered-creator cookie (see creator-session.ts), so
 * logging in or out never changes — and can't be used to reset — this
 * identity or the free-usage count derived from it.
 */
export async function getOrCreateAnonymousId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = randomUUID();
  cookieStore.set(COOKIE_NAME, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return id;
}
