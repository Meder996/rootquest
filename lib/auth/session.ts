import { db } from "@/lib/db";
import { nowIso, uid } from "@/lib/utils";
import {
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
  type SessionTokenPayload,
} from "./jwt";
import { SESSION_COOKIE } from "./constants";
import type { Profile } from "@/types";

export { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS };

export interface SessionContext {
  user: Profile;
  sessionId: string;
  token: string;
}

/** Create a session row and return the signed token + session id. */
export async function issueSession(
  user: Profile
): Promise<{ sessionId: string; token: string; expiresAt: string }> {
  const sessionId = uid();
  const expiresAt = new Date(
    Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  ).toISOString();
  db.run(
    "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    sessionId,
    user.id,
    expiresAt,
    nowIso()
  );
  const token = await signSessionToken({
    sub: user.id,
    sid: sessionId,
    role: user.role,
  });
  return { sessionId, token, expiresAt };
}

export function revokeSession(sessionId: string): void {
  db.run("UPDATE sessions SET revoked_at = ? WHERE id = ?", nowIso(), sessionId);
}

export function revokeAllUserSessions(userId: string): void {
  db.run(
    "UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL",
    nowIso(),
    userId
  );
}

interface SessionRow {
  id: string;
  user_id: string;
  expires_at: string;
  revoked_at: string | null;
}

/**
 * Resolve the authenticated user from a session token string.
 * Returns null when the token is missing, invalid, expired or revoked.
 * Authorization is always enforced server-side — never trust the client.
 */
export async function resolveSession(
  token: string | undefined | null
): Promise<SessionContext | null> {
  if (!token) return null;
  let payload: SessionTokenPayload;
  try {
    payload = await verifySessionToken(token);
  } catch {
    return null;
  }
  const session = db.get<SessionRow>(
    "SELECT id, user_id, expires_at, revoked_at FROM sessions WHERE id = ?",
    payload.sid
  );
  if (!session || session.revoked_at) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;
  const user = db.get<Profile>(
    "SELECT id, email, name, role, daily_goal, sat_date, timezone, email_verified, preferences, created_at, updated_at FROM profiles WHERE id = ?",
    payload.sub
  );
  if (!user) return null;
  // Keep the token role claim in sync with the database (role changes take
  // effect immediately, even inside an existing session).
  return { user, sessionId: session.id, token };
}

export function sessionCookieOptions(expiresAt?: string) {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt ? new Date(expiresAt) : undefined,
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
