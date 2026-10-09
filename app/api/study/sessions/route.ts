import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { startStudySession } from "@/lib/data/learning";
import { studySessionSchema } from "@/lib/validation/schemas";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** POST /api/study/sessions — start a study session. */
export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  const body = studySessionSchema.parse(await parseJsonBody(request));
  const session = startStudySession(user.id, body.mode);
  return json({ session });
});
