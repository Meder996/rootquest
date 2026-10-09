import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { issueSession } from "@/lib/auth/session";
import { createToken } from "@/lib/auth/tokens";
import { registerSchema } from "@/lib/validation/schemas";
import { ApiError } from "@/lib/auth/guards";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { handleApi, json, parseJsonBody, publicUser, setSessionCookie } from "@/lib/api-helpers";
import { nowIso, uid } from "@/lib/utils";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

export const POST = handleApi(async (request: NextRequest) => {
  if (!rateLimit(clientKey(request, "register"), 10, 60 * 60 * 1000)) {
    throw new ApiError(429, "Too many registration attempts. Please try again later.");
  }
  const body = registerSchema.parse(await parseJsonBody(request));
  const existing = db.get<{ id: string }>(
    "SELECT id FROM profiles WHERE email = ?",
    body.email
  );
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }
  const id = uid();
  db.run(
    `INSERT INTO profiles
      (id, email, password_hash, name, role, daily_goal, timezone, email_verified, preferences, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'student', 20, 'UTC', 0, '{}', ?, ?)`,
    id,
    body.email,
    await hashPassword(body.password),
    body.name,
    nowIso(),
    nowIso()
  );
  db.run("INSERT INTO user_stats (user_id) VALUES (?)", id);

  const { token: verificationToken } = createToken(
    "email_verification_tokens",
    id,
    24 * 7
  );

  const user = db.get("SELECT * FROM profiles WHERE id = ?", id)!;
  const session = await issueSession(user as never);

  const response = json({
    user: publicUser(user as never),
    // In production the verification link is emailed instead.
    devVerificationToken:
      process.env.NODE_ENV === "production" ? undefined : verificationToken,
  });
  return setSessionCookie(response, session.token, session.expiresAt);
});
