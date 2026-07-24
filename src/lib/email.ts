import nodemailer from "nodemailer";

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
 * EMAIL_PROVIDER=smtp     -> sends via SMTP using SMTP_HOST/PORT/USER/PASSWORD
 */
export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<void> {
  const provider = (process.env.EMAIL_PROVIDER || "console").toLowerCase();
  const from = process.env.EMAIL_FROM || "CreatorOS <hello@creatoros.dev>";

  if (provider === "smtp") {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !user || !pass) {
      console.warn(
        "[email] EMAIL_PROVIDER=smtp but SMTP_HOST/SMTP_USER/SMTP_PASSWORD are not fully set. Falling back to console logging."
      );
      logToConsole({ to, subject, text });
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({ from, to, subject, html, text });
    return;
  }

  // Default / development mode.
  logToConsole({ to, subject, text });
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
