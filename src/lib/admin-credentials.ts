import bcrypt from "bcryptjs";

/**
 * Validates admin credentials against environment variables.
 *
 * ADMIN_PASSWORD may be either:
 *  - a bcrypt hash (starts with "$2a$", "$2b$" or "$2y$") — recommended for production.
 *    Generate one with: npm run hash-password -- "your-password"
 *  - a plain string — only intended for local development convenience.
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in your .env file.");
  }

  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
    return false;
  }

  const isHashed = /^\$2[aby]\$/.test(adminPassword);
  if (isHashed) {
    return bcrypt.compare(password, adminPassword);
  }

  // Development fallback: constant-time-ish plain comparison.
  return timingSafeEqual(password, adminPassword);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still iterate to avoid trivially short-circuiting on length alone.
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      void ((a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0));
    }
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
