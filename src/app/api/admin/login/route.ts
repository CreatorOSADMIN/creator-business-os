import { NextRequest, NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation";
import { verifyAdminCredentials } from "@/lib/admin-credentials";
import { createAdminSession } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifySameOrigin } from "@/lib/verify-origin";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  const ip = getClientIp(request.headers);
  const { allowed } = rateLimit(`admin-login:${ip}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  } catch (err) {
    logger.error("admin-login: configuration error", { scope: "admin-login", err });
    return NextResponse.json(
      { error: "Admin authentication is not configured correctly on the server." },
      { status: 500 }
    );
  }

  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createAdminSession(parsed.data.email);
  return NextResponse.json({ ok: true });
}
