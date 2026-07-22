import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { serializeCreator } from "@/lib/serialize-creator";
import { CREATOR_STATUSES } from "@/lib/constants";
import { verifySameOrigin } from "@/lib/verify-origin";
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

  const { response } = await requireAdmin();
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

  return NextResponse.json({ creator: serializeCreator(creator) });
}
