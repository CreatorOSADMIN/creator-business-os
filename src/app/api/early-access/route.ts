import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creatorRegistrationSchema } from "@/lib/validation";
import { generateReferralCode } from "@/lib/referral";
import { sendEmail, buildConfirmationEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifySameOrigin } from "@/lib/verify-origin";

export async function POST(request: NextRequest) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const ip = getClientIp(request.headers);
  const { allowed } = rateLimit(`early-access:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot field: bots that fill hidden fields are silently rejected
  // without revealing detection logic to the client.
  if (typeof body === "object" && body !== null && "website" in body && (body as { website?: string }).website) {
    return NextResponse.json({ ok: true, creatorId: "ignored" }, { status: 201 });
  }

  const parsed = creatorRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const existing = await prisma.creator.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json(
      { error: "This email address is already registered for early access." },
      { status: 409 }
    );
  }

  let referredBy: string | null = null;
  if (data.referralCode) {
    const referrer = await prisma.creator.findUnique({
      where: { referralCode: data.referralCode.trim().toUpperCase() },
      select: { referralCode: true },
    });
    referredBy = referrer?.referralCode ?? null;
  }

  let referralCode = generateReferralCode();
  for (let attempts = 0; attempts < 5; attempts++) {
    const clash = await prisma.creator.findUnique({ where: { referralCode } });
    if (!clash) break;
    referralCode = generateReferralCode();
  }

  const creator = await prisma.creator.create({
    data: {
      fullName: data.fullName,
      creatorHandle: data.creatorHandle,
      email: data.email,
      country: data.country,
      platforms: JSON.stringify(data.platforms),
      platformUrls: JSON.stringify(data.platformUrls ?? {}),
      audienceSize: data.audienceSize,
      publishingFrequency: data.publishingFrequency,
      creatorExperience: data.creatorExperience,
      biggestChallenge: data.biggestChallenge,
      productInterests: JSON.stringify(data.productInterests),
      privacyAccepted: data.privacyAccepted,
      marketingConsent: data.marketingConsent,
      referralCode,
      referredBy,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
    },
  });

  try {
    const { subject, html, text } = buildConfirmationEmail({
      fullName: creator.fullName,
      creatorId: creator.id,
      referralCode: creator.referralCode,
    });
    await sendEmail({ to: creator.email, subject, html, text });
  } catch (err) {
    // Registration must succeed even if the email provider is unavailable.
    console.error("[early-access] Failed to send confirmation email:", err);
  }

  return NextResponse.json(
    {
      ok: true,
      creatorId: creator.id,
      referralCode: creator.referralCode,
      createdAt: creator.createdAt,
    },
    { status: 201 }
  );
}
