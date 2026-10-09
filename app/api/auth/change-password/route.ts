import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { revokeAllUserSessions, issueSession } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validation/schemas";
import { requireUser, ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody, publicUser, setSessionCookie } from "@/lib/api-helpers";
import { nowIso } from "@/lib/utils";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  const body = changePasswordSchema.parse(await parseJsonBody(request));
  const full = db.get<{ password_hash: string }>(
    "SELECT password_hash FROM profiles WHERE id = ?",
    user.id
  );
  if (!full || !(await verifyPassword(body.currentPassword, full.password_hash))) {
    throw new ApiError(400, "Your current password is incorrect.");
  }
  db.run(
    "UPDATE profiles SET password_hash = ?, updated_at = ? WHERE id = ?",
    await hashPassword(body.newPassword),
    nowIso(),
    user.id
  );
  revokeAllUserSessions(user.id);
  const updated = db.get("SELECT * FROM profiles WHERE id = ?", user.id)!;
  const session = await issueSession(updated as never);
  const response = json({ user: publicUser(updated as never) });
  return setSessionCookie(response, session.token, session.expiresAt);
});
