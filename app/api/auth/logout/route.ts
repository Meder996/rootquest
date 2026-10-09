import { NextRequest } from "next/server";
import { revokeSession, SESSION_COOKIE } from "@/lib/auth/session";
import { handleApi, noContent, clearSessionCookie } from "@/lib/api-helpers";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

export const POST = handleApi(async (request: NextRequest) => {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    // The session id is embedded in the token; revoke it server-side so the
    // session is invalidated even if the cookie is replayed.
    const { resolveSession } = await import("@/lib/auth/session");
    const ctx = await resolveSession(token);
    if (ctx) revokeSession(ctx.sessionId);
  }
  return clearSessionCookie(noContent());
});
