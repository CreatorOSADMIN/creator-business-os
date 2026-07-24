import { NextRequest, NextResponse } from "next/server";
import { clearRegisteredCreatorCookie } from "@/lib/creator-session";
import { verifySameOrigin } from "@/lib/verify-origin";

export async function POST(request: NextRequest) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  await clearRegisteredCreatorCookie();
  return NextResponse.json({ ok: true });
}
