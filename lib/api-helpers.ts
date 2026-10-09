import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError } from "./auth/guards";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./auth/session";

export function json(data: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/** Standard error -> JSON response mapping. */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    const first = error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid input", issues: error.issues },
      { status: 400 }
    );
  }
  console.error("[api] unhandled error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/** Wrap a route handler with uniform error handling. */
export function handleApi<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: string
): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

/** Public user object (never includes the password hash). */
export function publicUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  daily_goal: number;
  sat_date: string | null;
  timezone: string;
  email_verified: number;
  preferences: string;
  created_at: string;
  updated_at: string;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    dailyGoal: user.daily_goal,
    satDate: user.sat_date,
    timezone: user.timezone,
    emailVerified: user.email_verified === 1,
    preferences: safeParseJson(user.preferences),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export function safeParseJson(value: string | null | undefined): unknown {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
