import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Lightweight liveness/readiness endpoint for uptime monitors and load
 * balancers. Confirms the process is up and the database is reachable.
 * No auth required (nothing sensitive is returned) and no caching, so
 * every check reflects the current state.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        db: "connected",
        responseTimeMs: Date.now() - startedAt,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    logger.error("health: database check failed", { scope: "health", err });
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        db: "disconnected",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
