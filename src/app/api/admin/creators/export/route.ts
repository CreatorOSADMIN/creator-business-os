import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { toCsv } from "@/lib/csv";
import { LEAD_CSV_HEADERS, buildLeadCsvRow } from "@/lib/lead-export";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const creators = await prisma.creator.findMany({
    select: {
      email: true,
      createdAt: true,
      emailVerifiedAt: true,
      status: true,
      privacyAccepted: true,
      gdprConsentAt: true,
      privacyPolicyVersion: true,
      utmSource: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = creators.map(buildLeadCsvRow);

  const csv = toCsv([...LEAD_CSV_HEADERS], rows);
  const filename = `early-access-leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
