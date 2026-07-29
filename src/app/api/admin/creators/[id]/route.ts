import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { serializeCreator } from "@/lib/serialize-creator";
import { CREATOR_STATUSES } from "@/lib/constants";
import { verifySameOrigin } from "@/lib/verify-origin";
import { logAdminAction } from "@/lib/audit-log";
import { logger } from "@/lib/logger";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(CREATOR_STATUSES).optional(),
  internalNotes: z.string().max(10000).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const creator = await prisma.creator.findUnique({ where: { id } });
  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const referrals = await prisma.creator.findMany({
    where: { referredBy: creator.referralCode },
    select: { id: true, fullName: true, creatorHandle: true, status: true, createdAt: true },
  });

  return NextResponse.json({ creator: serializeCreator(creator), referrals });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const { session, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.creator.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const creator = await prisma.creator.update({
    where: { id },
    data: {
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      ...(parsed.data.internalNotes !== undefined ? { internalNotes: parsed.data.internalNotes } : {}),
    },
  });

  logAdminAction({
    action: "creator.update",
    actor: session.email,
    creatorId: id,
    metadata: {
      statusChanged: parsed.data.status !== undefined,
      notesChanged: parsed.data.internalNotes !== undefined,
    },
  });

  return NextResponse.json({ creator: serializeCreator(creator) });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const { session, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid creator id" }, { status: 400 });
  }

  try {
    await prisma.creator.delete({ where: { id } });
  } catch (err) {
    // P2025 = record to delete does not exist (Prisma error code).
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }
    logger.error("creators: delete failed", { scope: "admin-creators-delete", creatorId: id, err });
    return NextResponse.json({ error: "Unable to delete this creator. Please try again." }, { status: 500 });
  }

  logAdminAction({ action: "creator.delete", actor: session.email, creatorId: id });

  return NextResponse.json({ success: true });
}
