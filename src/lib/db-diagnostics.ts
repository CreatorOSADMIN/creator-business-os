import { prisma } from "@/lib/prisma";

/**
 * Read-only, secret-free diagnostics about the production database and its
 * backup posture. Intended for the admin-only system-status endpoint and
 * the `db:backup-check` CLI script — never for public/unauthenticated
 * responses.
 *
 * Nothing here ever returns credentials, connection strings, row data, or
 * anything else that could be considered sensitive/PII: only connectivity,
 * driver/server metadata, and migration bookkeeping.
 */

export interface DbDiagnostics {
  connected: boolean;
  /** Postgres server version string (e.g. "PostgreSQL 16.4 ..."), if reachable. */
  serverVersion: string | null;
  /** Database host only (never the full connection string / credentials). */
  host: string | null;
  /** Whether the connection string requires TLS (`sslmode=require` or similar). */
  sslEnforced: boolean | null;
  /** Most recently applied Prisma migration, if the migrations table is reachable. */
  lastMigration: { name: string; finishedAt: string | null } | null;
  error: string | null;
}

/** Extracts only the host (no credentials, no path/query) from DATABASE_URL. */
export function getSafeDbHost(): string | null {
  const raw = process.env.DATABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).host || null;
  } catch {
    return null;
  }
}

/** True if the connection string opts into TLS via a recognized sslmode value. */
export function isSslEnforced(): boolean | null {
  const raw = process.env.DATABASE_URL;
  if (!raw) return null;
  try {
    const sslmode = new URL(raw).searchParams.get("sslmode");
    return sslmode ? ["require", "verify-ca", "verify-full"].includes(sslmode) : false;
  } catch {
    return null;
  }
}

/**
 * Runs a handful of cheap, read-only checks against the production
 * database. Never throws — failures are reported in the `error` field so
 * callers (health/system-status endpoints, CLI scripts) can display a
 * result either way.
 */
export async function collectDbDiagnostics(): Promise<DbDiagnostics> {
  const host = getSafeDbHost();
  const sslEnforced = isSslEnforced();

  try {
    const versionRows = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`;
    const serverVersion = versionRows[0]?.version ?? null;

    let lastMigration: DbDiagnostics["lastMigration"] = null;
    try {
      const rows = await prisma.$queryRaw<{ migration_name: string; finished_at: Date | null }[]>`
        SELECT migration_name, finished_at
        FROM "_prisma_migrations"
        ORDER BY finished_at DESC NULLS LAST
        LIMIT 1
      `;
      if (rows[0]) {
        lastMigration = {
          name: rows[0].migration_name,
          finishedAt: rows[0].finished_at ? rows[0].finished_at.toISOString() : null,
        };
      }
    } catch {
      // Migrations table not reachable/present (e.g. restricted DB role) —
      // not fatal, the connectivity check above already succeeded.
    }

    return { connected: true, serverVersion, host, sslEnforced, lastMigration, error: null };
  } catch (err) {
    return {
      connected: false,
      serverVersion: null,
      host,
      sslEnforced,
      lastMigration: null,
      error: err instanceof Error ? err.message : "Unknown database error",
    };
  }
}
