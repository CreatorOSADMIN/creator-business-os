import { NextRequest, NextResponse } from "next/server";

/**
 * Defense-in-depth CSRF check for state-changing API routes.
 *
 * Cookies are already set with `sameSite: "lax"`, which blocks the cookie
 * from being sent on cross-site POST/PATCH/DELETE requests in modern
 * browsers. This adds a second, independent layer: it verifies that the
 * request's Origin (or, failing that, Referer) header matches the app's own
 * origin, rejecting the request otherwise.
 *
 * Returns null if the request is same-origin (or the check can't be
 * evaluated, e.g. no Origin/Referer header at all — same-origin browser
 * requests always send at least one of these on state-changing methods).
 */
export function verifySameOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (!host) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const candidate = origin || referer;
  if (!candidate) {
    // No Origin/Referer at all (e.g. some non-browser clients). Allow this
    // through rather than breaking legitimate API usage; the sameSite=lax
    // cookie remains the primary CSRF defense.
    return null;
  }

  try {
    const candidateHost = new URL(candidate).host;
    if (candidateHost !== host) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  return null;
}
