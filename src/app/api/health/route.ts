import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportIncident } from "@/lib/monitoring";

/**
 * Lightweight liveness/readiness endpoint for uptime monitors and load
 * balancers. Confirms the process is up and the database is reachable.
 * No auth required (nothing sensitive is returned) and no caching, so
 * every check reflects the current state.
 */
export const dynamic = "force-dynamic";

// Above this, the DB is reachable but slow enough to be worth flagging —
// reported as a (non-failing) incident so a future alert provider can
// surface creeping latency before it becomes an outage.
const DEGRADED_RESPONSE_TIME_MS = 1000;

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTimeMs = Date.now() - startedAt;

    if (responseTimeMs > DEGRADED_RESPONSE_TIME_MS) {
      reportIncident("health_check_degraded", { scope: "health", responseTimeMs });
    }

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        db: "connected",
        responseTimeMs,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    reportIncident("health_check_failed", { scope: "health", err });
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
