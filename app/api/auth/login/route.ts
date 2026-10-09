import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { issueSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";
import { ApiError } from "@/lib/auth/guards";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { handleApi, json, parseJsonBody, publicUser, setSessionCookie } from "@/lib/api-helpers";
import type { ProfileWithPassword } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

export const POST = handleApi(async (request: NextRequest) => {
  if (!rateLimit(clientKey(request, "login"), 10, 15 * 60 * 1000)) {
    throw new ApiError(429, "Too many login attempts. Please try again later.");
  }
  const body = loginSchema.parse(await parseJsonBody(request));
  const user = db.get<ProfileWithPassword>(
    "SELECT * FROM profiles WHERE email = ?",
    body.email
  );
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }
  const ok = await verifyPassword(body.password, user.password_hash);
  if (!ok) {
    throw new ApiError(401, "Invalid email or password.");
  }
  const session = await issueSession(user);
  const response = json({ user: publicUser(user) });
  return setSessionCookie(response, session.token, session.expiresAt);
});
