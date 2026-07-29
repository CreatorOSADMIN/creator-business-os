const PRODUCTION_SITE_URL = "https://www.creatoroslaunch.site";

/**
 * Resolves the canonical site URL for building absolute links (metadata,
 * sitemap, robots.txt, verification emails).
 *
 * Reads `process.env` directly rather than the validated `getPublicEnv()`
 * so it works during static generation (sitemap/robots/metadata) before
 * env validation runs, and falls back to the real production domain
 * instead of localhost whenever NODE_ENV is production.
 */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : "http://localhost:3000")
  );
}
