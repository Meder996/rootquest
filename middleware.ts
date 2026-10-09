import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/jwt";

/**
 * Route protection middleware.
 *
 * This is the first line of defense: it keeps unauthenticated visitors away
 * from student pages and keeps non-admins away from admin pages. It only
 * verifies the signed session token (no database access in the edge
 * runtime) — every page and API route re-checks authorization server-side
 * against the database, which is the real security boundary.
 */

const PUBLIC_PREFIXES = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/lesson/sample",
  "/quiz/demo",
  "/auth",
];

const STUDENT_PREFIXES = [
  "/dashboard",
  "/learn",
  "/study",
  "/quiz",
  "/review",
  "/progress",
  "/achievements",
  "/saved",
  "/profile",
];

const ADMIN_PREFIXES = ["/admin"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

async function getTokenRole(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const payload = await verifySessionToken(token);
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api")) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const role = await getTokenRole(token);

  // Admin area: requires a valid session with the admin role.
  if (matchesPrefix(pathname, ADMIN_PREFIXES)) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/auth/log-in?next=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Student area: requires a valid session.
  if (matchesPrefix(pathname, STUDENT_PREFIXES) && pathname !== "/quiz/demo") {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/auth/log-in?next=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    return NextResponse.next();
  }

  // Authenticated users visiting auth pages go to the dashboard.
  if (matchesPrefix(pathname, ["/auth"]) && token && !pathname.startsWith("/auth/verify-email")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)"],
};
