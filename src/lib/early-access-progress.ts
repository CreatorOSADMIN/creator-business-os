import { prisma } from "@/lib/prisma";

/** Displayed progress before any real verified creators are counted. */
export const EARLY_ACCESS_BASE_PERCENT = 23;
/** Share of the bar driven by real verified creators (up to the goal). */
export const EARLY_ACCESS_RANGE_PERCENT = 77;
/** Verified creators needed to fill the bar to 100%. */
export const EARLY_ACCESS_GOAL = 1000;

/** Real count of creators with a verified email. Never includes unverified signups. */
export async function getVerifiedCreatorsCount(): Promise<number> {
  return prisma.creator.count({ where: { emailVerifiedAt: { not: null } } });
}

/** progress = min(100, 23 + (verified / goal) * 77) */
export function computeEarlyAccessProgress(verifiedCount: number): number {
  const raw =
    EARLY_ACCESS_BASE_PERCENT + (verifiedCount / EARLY_ACCESS_GOAL) * EARLY_ACCESS_RANGE_PERCENT;
  return Math.min(100, raw);
}

export async function getEarlyAccessProgress() {
  const verifiedCount = await getVerifiedCreatorsCount();
  return { progress: computeEarlyAccessProgress(verifiedCount), goal: EARLY_ACCESS_GOAL };
}
