# Email delivery — required environment variables

`src/lib/email.ts` sends the Early Access verification email. Behavior is controlled by `EMAIL_PROVIDER`:

- `EMAIL_PROVIDER` unset or `console` — logs the email to the server terminal instead of sending it. Default for local development.
- `EMAIL_PROVIDER=smtp` — sends via SMTP. **Required in production.**

## Vercel Production variables

| Variable | Required | Notes |
|---|---|---|
| `EMAIL_PROVIDER` | yes | Set to `smtp` |
| `EMAIL_USER` | yes* | Dedicated CreatorOS Gmail address. Alias: `SMTP_USER`. |
| `EMAIL_APP_PASSWORD` | yes* | 16-character Gmail **App Password** (not the account password). Alias: `SMTP_PASSWORD`. |
| `SMTP_HOST` | no | Defaults to `smtp.gmail.com` |
| `SMTP_PORT` | no | Defaults to `465` |
| `EMAIL_FROM` | no | Defaults to `CreatorOS <hello@creatoroslaunch.site>`. Should match (or be an alias/alias-authorized address of) the authenticated `EMAIL_USER`/`SMTP_USER` account, or Gmail may rewrite/flag the `From` header. |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical production URL: `https://www.creatoroslaunch.site`; used to build the verification link. Falls back to this same domain in production if unset, and to `http://localhost:3000` in development. |
| `SESSION_SECRET` | yes (existing) | Required by `src/lib/creator-session.ts`; unrelated to email but required for the registration flow to fully succeed. |
| `DATABASE_URL` | yes (existing) | Existing Prisma/Neon connection string. |

\* Either `EMAIL_USER`/`EMAIL_APP_PASSWORD` or `SMTP_USER`/`SMTP_PASSWORD` — both names are accepted, one pair is required.

## Generating a Gmail App Password

1. Create/use the dedicated CreatorOS Gmail account.
2. Enable 2-Step Verification on that account.
3. Google Account → Security → App Passwords → generate one for "Mail".
4. Use that 16-character value as `EMAIL_APP_PASSWORD` (do not use the normal account password).

Never commit real values for any of the above — set them in the Vercel project's Environment Variables settings.
