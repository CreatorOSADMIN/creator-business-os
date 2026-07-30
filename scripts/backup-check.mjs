/**
 * Read-only production backup/connectivity check for the Neon PostgreSQL
 * database. Run manually or on a schedule (e.g. a periodic CI job) to
 * confirm the database is reachable and correctly configured for Neon's
 * managed backups (point-in-time recovery), before relying on it.
 *
 * This script never prints DATABASE_URL, credentials, or any row data —
 * only host, TLS status, server version, and migration bookkeeping.
 *
 * Usage:
 *   node scripts/backup-check.mjs
 *
 * Exit code is non-zero if the database is unreachable, so it can be wired
 * into a monitoring cron/CI step.
 */
import { PrismaClient } from "@prisma/client";

function getSafeHost(rawUrl) {
  try {
    return new URL(rawUrl).host || null;
  } catch {
    return null;
  }
}

function isSslEnforced(rawUrl) {
  try {
    const sslmode = new URL(rawUrl).searchParams.get("sslmode");
    return sslmode ? ["require", "verify-ca", "verify-full"].includes(sslmode) : false;
  } catch {
    return null;
  }
}

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("DATABASE_URL is not set. Aborting (no connection attempted).");
    process.exitCode = 1;
    return;
  }

  const host = getSafeHost(rawUrl);
  const sslEnforced = isSslEnforced(rawUrl);

  console.log("=== Production database backup/connectivity check ===");
  console.log(`Host:          ${host ?? "(unparseable)"}`);
  console.log(`TLS enforced:  ${sslEnforced === null ? "unknown" : sslEnforced}`);
  if (sslEnforced === false) {
    console.warn(
      "WARNING: sslmode is not set to require/verify-ca/verify-full. " +
        "Neon requires TLS in production — add `sslmode=require` to DATABASE_URL."
    );
  }

  const prisma = new PrismaClient();
  try {
    const versionRows = await prisma.$queryRaw`SELECT version()`;
    console.log(`Connected:     yes`);
    console.log(`Server:        ${versionRows?.[0]?.version ?? "unknown"}`);

    try {
      const rows = await prisma.$queryRaw`
        SELECT migration_name, finished_at
        FROM "_prisma_migrations"
        ORDER BY finished_at DESC NULLS LAST
        LIMIT 1
      `;
      if (rows?.[0]) {
        console.log(`Last migration: ${rows[0].migration_name} (${rows[0].finished_at ?? "pending"})`);
      } else {
        console.log("Last migration: none found");
      }
    } catch {
      console.log("Last migration: could not read _prisma_migrations (non-fatal)");
    }

    console.log("");
    console.log("Reminder — Neon backups are managed at the platform level:");
    console.log("  1. Confirm point-in-time recovery (PITR) retention window in the Neon console");
    console.log("     (Project > Settings > Backup/Restore).");
    console.log("  2. Confirm the retention window covers your RPO requirement.");
    console.log("  3. See docs/DISASTER_RECOVERY.md for the restore procedure.");
  } catch (err) {
    console.error(`Connected:     no`);
    console.error(`Error:         ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
