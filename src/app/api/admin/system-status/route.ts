import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { collectDbDiagnostics } from "@/lib/db-diagnostics";
import { logger } from "@/lib/logger";
import packageJson from "../../../../../package.json";

/**
 * Admin-only technical status endpoint: connectivity, migration state, and
 * app/runtime metadata for internal checks and investor due-diligence
 * walkthroughs. Deliberately separate from `/api/health` (public, minimal,
 * no auth): everything here requires an authenticated admin session and
 * still never returns credentials, connection strings, or row data.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const db = await collectDbDiagnostics();
  if (!db.connected) {
    logger.error("system-status: database unreachable", { scope: "system-status" });
  }

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      app: {
        name: packageJson.name,
        version: packageJson.version,
        nodeEnv: process.env.NODE_ENV ?? "unknown",
        uptimeSeconds: Math.round(process.uptime()),
      },
      database: {
        connected: db.connected,
        host: db.host,
        sslEnforced: db.sslEnforced,
        serverVersion: db.serverVersion,
        lastMigration: db.lastMigration,
        error: db.error,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
