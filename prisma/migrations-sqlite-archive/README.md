# SQLite migration archive

These three folders are the original SQLite-only migrations
(`20260722124823_init`, `20260724000000_email_verification`,
`20260725000000_creator_referredby_index`) plus their `migration_lock.toml`.

They are kept here only as historical reference. They are **not** inside
`prisma/migrations` anymore, so Prisma will never try to apply their
SQLite-specific SQL (e.g. `PRAGMA foreign_keys`, `DATETIME` columns) to
PostgreSQL.

The active `prisma/migrations` folder now contains a single
`20260725120000_postgresql_baseline` migration that creates the schema
directly in its final state (equivalent to these three migrations combined,
translated to PostgreSQL types), plus a `migration_lock.toml` pinned to
`provider = "postgresql"`.

## Deploying to the Neon PostgreSQL database

The production database on Neon was created empty (no tables, no Prisma
`_prisma_migrations` history yet), so no baselining trick is required:

```bash
# DATABASE_URL must point at the Neon connection string.
# Set it only in the deployment environment / secret manager, never in the repo.
npx prisma migrate deploy
```

This applies `20260725120000_postgresql_baseline` cleanly and records it in
`_prisma_migrations`.

If, at deploy time, the Neon database turns out to already contain these
tables (e.g. created manually or via `db push` beforehand), baseline it
instead of re-running the DDL:

```bash
npx prisma migrate resolve --applied 20260725120000_postgresql_baseline
```

`npx prisma migrate dev` was **not** run in this change because that requires
a live connection to the real `DATABASE_URL`, which was intentionally not
provided here.
