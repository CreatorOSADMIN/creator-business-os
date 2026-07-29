import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const creators = await prisma.creator.findMany({
    select: { email: true, createdAt: true, emailVerifiedAt: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = creators.map((c) => [
    c.email,
    c.createdAt.toISOString(),
    c.emailVerifiedAt ? "verified" : "pending",
  ]);

  const csv = toCsv(["email", "signup_date", "verification_status"], rows);
  const filename = `early-access-leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
