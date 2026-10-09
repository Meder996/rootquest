import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { consumeToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";
import { revokeAllUserSessions, issueSession } from "@/lib/auth/session";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { ApiError } from "@/lib/auth/guards";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { handleApi, json, parseJsonBody, publicUser, setSessionCookie } from "@/lib/api-helpers";
import { nowIso } from "@/lib/utils";
import type { Profile } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

export const POST = handleApi(async (request: NextRequest) => {
  if (!rateLimit(clientKey(request, "reset"), 10, 60 * 60 * 1000)) {
    throw new ApiError(429, "Too many reset attempts. Please try again later.");
  }
  const body = resetPasswordSchema.parse(await parseJsonBody(request));
  const userId = consumeToken("password_reset_tokens", body.token);
  if (!userId) {
    throw new ApiError(400, "This reset link is invalid or has expired.");
  }
  db.run(
    "UPDATE profiles SET password_hash = ?, updated_at = ? WHERE id = ?",
    await hashPassword(body.password),
    nowIso(),
    userId
  );
  // Invalidate every existing session after a password change.
  revokeAllUserSessions(userId);
  const user = db.get<Profile>("SELECT * FROM profiles WHERE id = ?", userId)!;
  const session = await issueSession(user);
  const response = json({ user: publicUser(user) });
  return setSessionCookie(response, session.token, session.expiresAt);
});
