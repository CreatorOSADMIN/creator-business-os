import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/session";

// Next.js 16 runs `proxy` on the nodejs runtime (the edge runtime is no
// longer used here), but we still verify the JWT directly against the
// request's cookies rather than importing lib/session.ts, since that module
// uses the next/headers `cookies()` helper meant for Server
// Components/Route Handlers rather than the proxy layer.
function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const secretKey = getSecretKey();

  if (!token || !secretKey) {
    return redirectToLogin(request);
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.role !== "admin") {
      return redirectToLogin(request);
    }
  } catch {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
