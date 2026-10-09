import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, resolveSession, type SessionContext } from "./session";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/** Authenticate a route-handler request. Returns null when unauthenticated. */
export async function getRequestUser(
  request: NextRequest
): Promise<SessionContext | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return resolveSession(token);
}

/** Require an authenticated user; throws ApiError(401) otherwise. */
export async function requireUser(
  request: NextRequest
): Promise<SessionContext> {
  const ctx = await getRequestUser(request);
  if (!ctx) throw new ApiError(401, "Authentication required. Please log in.");
  return ctx;
}

/** Require an authenticated admin; throws ApiError(401/403) otherwise. */
export async function requireAdmin(
  request: NextRequest
): Promise<SessionContext> {
  const ctx = await requireUser(request);
  if (ctx.user.role !== "admin") {
    throw new ApiError(403, "Administrator access required.");
  }
  return ctx;
}

/** Authenticate a Server Component / Server Action (uses next/headers). */
export async function getSessionUser(): Promise<SessionContext | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return resolveSession(token);
}

export async function requireSessionUser(): Promise<SessionContext> {
  const ctx = await getSessionUser();
  if (!ctx) throw new ApiError(401, "Authentication required. Please log in.");
  return ctx;
}

export async function requireAdminUser(): Promise<SessionContext> {
  const ctx = await requireSessionUser();
  if (ctx.user.role !== "admin") {
    throw new ApiError(403, "Administrator access required.");
  }
  return ctx;
}

export function isAdmin(user: { role: string } | null | undefined): boolean {
  return !!user && user.role === "admin";
}
