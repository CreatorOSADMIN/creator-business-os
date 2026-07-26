import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRegisteredCreatorIdFromCookie } from "@/lib/creator-session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Lets the device that started registration find out whether the email was
 * since verified (e.g. the link was opened on a different device). The
 * creator is resolved only from this browser's signed, httpOnly session
 * cookie — never from a query param or body — so a caller can only ever
 * poll their own registration's status, not anyone else's.
 */
export async function GET(request: NextRequest) {
  const creatorId = await getRegisteredCreatorIdFromCookie();
  if (!creatorId) {
    return NextResponse.json({ error: "No pending registration on this device." }, { status: 401 });
  }

  // Light polling is expected from the pending page, but cap it well above
  // that so a runaway client/tab can't hammer the DB.
  const ip = getClientIp(request.headers);
  const { allowed } = rateLimit(`early-access-status:${creatorId}:${ip}`, {
    limit: 40,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    select: { emailVerifiedAt: true, referralCode: true },
  });

  if (!creator) {
    // Cookie outlived the record (e.g. deleted). Nothing to report.
    return NextResponse.json({ verified: false });
  }

  if (!creator.emailVerifiedAt) {
    return NextResponse.json({ verified: false });
  }

  return NextResponse.json({
    verified: true,
    id: creatorId,
    referralCode: creator.referralCode,
  });
}
