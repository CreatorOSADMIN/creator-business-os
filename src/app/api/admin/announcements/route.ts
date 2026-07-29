import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { verifySameOrigin } from "@/lib/verify-origin";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit-log";
import { logger } from "@/lib/logger";

const announcementSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  body: z.string().trim().min(1, "Body is required").max(20000),
});

const emailSchema = z.string().trim().toLowerCase().email();

export async function POST(request: NextRequest) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const { session, response } = await requireAdmin();
  if (response) return response;

  // Sending to the whole list is expensive and easy to fat-finger twice in a
  // row; throttle per admin session rather than per IP.
  const limit = rateLimit(`announcement:${session.email}`, { limit: 3, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many announcements sent recently. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { subject, body: text } = parsed.data;
  const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;white-space:pre-wrap;">${escapeHtml(text)}</div>`;

  const creators = await prisma.creator.findMany({ select: { email: true } });

  let sent = 0;
  let failed = 0;

  for (const creator of creators) {
    const emailCheck = emailSchema.safeParse(creator.email);
    if (!emailCheck.success) {
      failed += 1;
      continue;
    }
    try {
      // Sent individually (not BCC) so recipients never see each other's
      // addresses; sequential to stay within Gmail SMTP sending limits.
      await sendEmail({ to: emailCheck.data, subject, html, text });
      sent += 1;
    } catch (err) {
      failed += 1;
      logger.error("announcements: send failed", { scope: "admin-announcements", err });
    }
  }

  logAdminAction({
    action: "announcement.send",
    actor: session.email,
    metadata: { subject, sent, failed, total: creators.length },
  });

  return NextResponse.json({
    sent,
    failed,
    total: creators.length,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
