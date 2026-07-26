import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getEarlyAccessProgress } from "@/lib/early-access-progress";

// Public, unauthenticated: returns only the aggregate progress percentage
// (derived from verified-creator count) needed to render the homepage
// progress bar. No emails, names, handles, or per-creator data.
export const revalidate = 60;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const { allowed } = rateLimit(`early-access-progress:${ip}`, {
    limit: 30,
    windowMs: 5 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const { progress, goal } = await getEarlyAccessProgress();
  return NextResponse.json({ progress, goal });
}
