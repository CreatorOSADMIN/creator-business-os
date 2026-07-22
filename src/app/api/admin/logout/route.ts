import { NextRequest, NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/session";
import { verifySameOrigin } from "@/lib/verify-origin";

export async function POST(request: NextRequest) {
  const originCheck = verifySameOrigin(request);
  if (originCheck) return originCheck;

  await destroyAdminSession();
  return NextResponse.json({ ok: true });
}
