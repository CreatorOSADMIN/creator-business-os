import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";

/**
 * Returns the admin session if authenticated, otherwise returns a
 * NextResponse (401) that the caller should return immediately.
 */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return {
      session: null as null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, response: null };
}
