import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getRequestUser } from "@/lib/auth/guards";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { feedbackSchema } from "@/lib/validation/schemas";
import { nowIso, uid } from "@/lib/utils";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** POST /api/feedback — submit feedback (also used by the public contact page). */
export const POST = handleApi(async (request: NextRequest) => {
  if (!rateLimit(clientKey(request, "feedback"), 10, 60 * 60 * 1000)) {
    throw new ApiError(429, "Too many feedback submissions. Please try again later.");
  }
  const body = feedbackSchema.parse(await parseJsonBody(request));
  const ctx = await getRequestUser(request);
  const subject = body.subject ?? (body.reportedQuestionId ? `Question report: ${body.reportedQuestionId}` : null);
  db.run(
    "INSERT INTO feedback (id, user_id, subject, message, status, created_at) VALUES (?, ?, ?, ?, 'new', ?)",
    uid(),
    ctx?.user.id ?? null,
    subject,
    body.message,
    nowIso()
  );
  return json({ ok: true, message: "Thanks — your feedback was submitted." });
});
