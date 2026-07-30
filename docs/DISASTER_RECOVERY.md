# Disaster Recovery — Neon PostgreSQL

Internal technical procedure. No credentials in this file — pull actual
connection strings from your secrets manager / Vercel project env vars.

## 1. Backup model

- Backups are handled by Neon (managed Postgres), not by this app.
- Neon provides continuous point-in-time recovery (PITR) within the
  project's configured retention window.
- Verify/adjust retention in the Neon console: **Project → Settings →
  Backup/Restore**.
- Run `npm run db:backup-check` periodically (or on a schedule) to confirm
  the app can reach the database and that TLS (`sslmode=require`) is set.
  It prints connectivity/version/migration info only — never credentials.

## 2. Restore procedure

1. In the Neon console, create a new branch from the desired point in time
   (or restore in place, per Neon's current restore UI/API).
2. Get the new branch's connection string from Neon (do **not** commit it).
3. Point a **staging** `DATABASE_URL` at the restored branch first.
4. Run `npx prisma migrate deploy` against staging to confirm the schema
   matches `prisma/migrations/` with no pending/failed migrations.
5. Spot-check row counts/integrity (e.g. `prisma studio` or a read-only
   query) before promoting.
6. Only after validation, update the production `DATABASE_URL` (Vercel
   project env vars) to point at the restored branch/database, then
   redeploy.
7. Confirm `/api/health` returns `status: "ok"` and, if you have an admin
   session, `/api/admin/system-status` shows `database.connected: true`
   and the expected `lastMigration`.

## 3. Regular verification checklist

- [ ] Neon PITR retention window matches business RPO requirement.
- [ ] `npm run db:backup-check` runs clean (TLS enforced, connected, latest
      migration matches `prisma/migrations/`).
- [ ] `DATABASE_URL` used in production includes `sslmode=require` (or
      stricter).
- [ ] Restore steps above have been rehearsed at least once against a
      staging branch (not just documented).

## 4. Notes

- This procedure does not change the database schema or app architecture.
- No credentials, tokens, or connection strings are stored in this repo;
  see `.env.example` for the variable names only.
