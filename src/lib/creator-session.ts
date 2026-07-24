import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "creatoros_registered_creator";
// Long-lived: this only needs to recognize a returning visitor on the same
// browser/device. It carries no sensitive data (just the creator's id), and
// the API route always re-verifies the id against the database before
// treating it as a valid registration.
const COOKIE_DURATION = "365d";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Set a strong SESSION_SECRET in your .env file."
    );
  }
  return new TextEncoder().encode(secret);
}

interface CreatorCookiePayload {
  creatorId: string;
}

/** Sets a signed, httpOnly cookie identifying this browser as belonging to `creatorId`. */
export async function setRegisteredCreatorCookie(creatorId: string) {
  const token = await new SignJWT({ creatorId } satisfies CreatorCookiePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(COOKIE_DURATION)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

/** Removes the signed creator-recognition cookie from this browser. */
export async function clearRegisteredCreatorCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Returns the creatorId encoded in the signed cookie, or null if there is no
 * cookie or it fails signature/shape verification. The caller is still
 * responsible for confirming the id corresponds to a real record — this
 * only proves the cookie hasn't been tampered with, not that the underlying
 * registration still exists.
 */
export async function getRegisteredCreatorIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.creatorId !== "string" || !payload.creatorId) return null;
    return payload.creatorId;
  } catch {
    return null;
  }
}
