import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends an email using the configured provider.
 *
 * EMAIL_PROVIDER=console  -> logs the email to stdout (default, zero-config dev mode)
 * EMAIL_PROVIDER=smtp     -> sends via SMTP.
 *   Production uses a dedicated Gmail account, so host/port default to
 *   Gmail's SMTP endpoint (smtp.gmail.com:465) and credentials can be given
 *   either as SMTP_USER/SMTP_PASSWORD (existing convention) or as
 *   EMAIL_USER/EMAIL_APP_PASSWORD (Gmail App Password). SMTP_HOST/SMTP_PORT
 *   still override the default for non-Gmail providers.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<void> {
  const provider = (process.env.EMAIL_PROVIDER || "console").toLowerCase();
  const from = process.env.EMAIL_FROM || "CreatorOS <hello@creatoroslaunch.site>";

  if (provider === "smtp") {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
      const missing = [
        !user && "SMTP_USER (or EMAIL_USER)",
        !pass && "SMTP_PASSWORD (or EMAIL_APP_PASSWORD)",
      ].filter(Boolean);
      // Falling back to console logging here would silently swallow real
      // delivery failures in any environment where EMAIL_PROVIDER=smtp was
      // intentionally set — the caller must know delivery did not happen.
      throw new Error(
        `[email] EMAIL_PROVIDER=smtp but missing required config: ${missing.join(", ")}`
      );
    }

    const transporter = getSmtpTransporter({ host, port, user, pass });

    try {
      await transporter.sendMail({ from, to, subject, html, text });
    } catch (err) {
      // Re-throw with a clear, secret-free message (never include auth/pass)
      // so the caller's logs point at the real cause (auth, connection,
      // rejected recipient, etc.) instead of a swallowed generic failure.
      const reason = err instanceof Error ? err.message : String(err);
      throw new Error(`[email] SMTP send failed (host=${host}, port=${port}): ${reason}`);
    }
    return;
  }

  // Default / development mode.
  logToConsole({ to, subject, text });
}

// Reused across calls (server modules stay warm between requests on the
// same instance), so sends don't each pay a fresh TCP/TLS handshake — a
// pooled connection is created once per process and kept alive.
let cachedTransporter: Transporter | null = null;
let cachedKey = "";

function getSmtpTransporter(config: {
  host: string;
  port: number;
  user: string;
  pass: string;
}): Transporter {
  const key = `${config.host}:${config.port}:${config.user}`;
  if (cachedTransporter && cachedKey === key) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
    pool: true,
    maxConnections: 3,
  });
  cachedKey = key;
  return cachedTransporter;
}

function logToConsole({ to, subject, text }: { to: string; subject: string; text: string }) {
  console.log("\n=== [DEV EMAIL] ==================================");
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("---------------------------------------------------");
  console.log(text);
  console.log("====================================================\n");
}

export function buildVerificationEmail(params: { fullName: string; verificationToken: string }) {
  const { fullName, verificationToken } = params;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "production" ? "https://www.creatoroslaunch.site" : "http://localhost:3000");
  const verificationLink = `${siteUrl}/early-access/verify?token=${verificationToken}`;

  const text = `Hi ${fullName},

Thanks for starting your CreatorOS Early Access registration.

Please confirm your email address by opening this link within 24 hours:
${verificationLink}

If you didn't request this, you can safely ignore this email.

— The CreatorOS team`;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2>Confirm your email, ${escapeHtml(fullName)}.</h2>
      <p>Thanks for starting your CreatorOS Early Access registration. Please confirm your email address to complete your registration:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p style="color:#666;font-size:13px;">This link expires in 24 hours. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  return { subject: "Confirm your email for CreatorOS Early Access", text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
