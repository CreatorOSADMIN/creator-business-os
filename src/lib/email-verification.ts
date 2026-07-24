import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Generates a cryptographically secure token and its storable hash. */
export function generateVerificationToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString("hex");
  return { rawToken, tokenHash: hashToken(rawToken) };
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/** Creates and persists a new one-time verification token for a creator. */
export async function createVerificationToken(creatorId: string): Promise<string> {
  const { rawToken, tokenHash } = generateVerificationToken();
  await prisma.emailVerificationToken.create({
    data: {
      creatorId,
      tokenHash,
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    },
  });
  return rawToken;
}

type VerifyResult =
  | { ok: true; creatorId: string; referralCode: string }
  | { ok: false; reason: "invalid" | "expired" };

/**
 * Verifies a raw token from a verification link. Looks the token up by its
 * hash (the raw value is never stored), checks it hasn't already been used
 * or expired, then atomically marks it used and the creator verified.
 */
export async function verifyCreatorEmailToken(rawToken: string): Promise<VerifyResult> {
  if (!rawToken || typeof rawToken !== "string") {
    return { ok: false, reason: "invalid" };
  }

  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { creator: { select: { id: true, referralCode: true, referredBy: true } } },
  });

  if (!record) return { ok: false, reason: "invalid" };
  if (record.usedAt) return { ok: false, reason: "invalid" };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };

  const now = new Date();
  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    }),
    prisma.creator.update({
      where: { id: record.creatorId },
      data: {
        emailVerifiedAt: now,
        ...(record.creator.referredBy ? { referralQualified: true } : {}),
      },
    }),
  ]);

  return { ok: true, creatorId: record.creator.id, referralCode: record.creator.referralCode };
}
