import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { revokeAllUserSessions } from "@/lib/auth/session";
import { handleApi, json, parseJsonBody, clearSessionCookie } from "@/lib/api-helpers";
import { z } from "zod";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

const schema = z.object({ confirm: z.literal(true) });

/** POST /api/profile/delete-account — permanently delete the account. */
export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  schema.parse(await parseJsonBody(request));
  revokeAllUserSessions(user.id);
  db.run("DELETE FROM profiles WHERE id = ?", user.id);
  return clearSessionCookie(json({ ok: true, message: "Your account was deleted." }));
});
