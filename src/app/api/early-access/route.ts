import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { creatorRegistrationSchema } from "@/lib/validation";
import { generateReferralCode } from "@/lib/referral";
import { sendEmail, buildVerificationEmail } from "@/lib/email";
import { createVerificationToken } from "@/lib/email-verification";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifySameOrigin } from "@/lib/verify-origin";
import { setRegisteredCreatorCookie } from "@/lib/creator-session";
import { logger } from "@/lib/logger";
import { PRIVACY_POLICY_VERSION } from "@/lib/constants";

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
  if (existing && existing.emailVerifiedAt) {
    return NextResponse.json(
      {
        error:
          "This email address is already registered for early access. If that's you, we'll be in touch — otherwise, use a different email.",
      },
      { status: 409 }
    );
  }

  let creator = existing;

  if (creator) {
    // Re-submission of an unverified signup: the consent checkbox was
    // re-confirmed on this submit, so refresh the GDPR audit trail too.
    creator = await prisma.creator.update({
      where: { id: creator.id },
      data: {
        privacyAccepted: data.privacyAccepted,
        marketingConsent: data.marketingConsent,
        gdprConsentAt: new Date(),
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      },
    });
  }

  if (!creator) {
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

    creator = await prisma.creator.create({
      data: {
        fullName: data.fullName,
        creatorHandle: data.creatorHandle,
        email: data.email,
        country: data.country,
        platforms: JSON.stringify(data.platforms),
        audienceSize: data.audienceSize,
        publishingFrequency: data.publishingFrequency,
        creatorExperience: data.creatorExperience,
        biggestChallenge: data.biggestChallenge,
        productInterests: JSON.stringify(data.productInterests),
        privacyAccepted: data.privacyAccepted,
        marketingConsent: data.marketingConsent,
        gdprConsentAt: new Date(),
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        referralCode,
        referredBy,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
      },
    });
  }

  // Existing-but-unverified creators (e.g. they lost the first email) get a
  // fresh token instead of a new duplicate record.
  const verificationToken = await createVerificationToken(creator.id);

  let emailSent = true;
  try {
    const { subject, html, text } = buildVerificationEmail({
      fullName: creator.fullName,
      verificationToken,
    });
    await sendEmail({ to: creator.email, subject, html, text });
  } catch (err) {
    // Registration must succeed even if the email provider is unavailable,
    // but the response must not claim the email was sent when it wasn't —
    // the client uses `emailSent` to show an accurate message and the user
    // can resubmit to retry delivery.
    emailSent = false;
    logger.error("early-access: failed to send verification email", {
      scope: "early-access",
      creatorId: creator.id,
      err,
    });
  }

  try {
    await setRegisteredCreatorCookie(creator.id);
  } catch (err) {
    // The registration itself already succeeded in the database; a cookie
    // failure (e.g. misconfigured SESSION_SECRET) must not turn this into a
    // failed request for the user.
    logger.error("early-access: failed to set recognition cookie", {
      scope: "early-access",
      creatorId: creator.id,
      err,
    });
  }

  return NextResponse.json(
    {
      ok: true,
      pending: true,
      creatorId: creator.id,
      email: creator.email,
      createdAt: creator.createdAt,
      emailSent,
    },
    { status: 201 }
  );
}
