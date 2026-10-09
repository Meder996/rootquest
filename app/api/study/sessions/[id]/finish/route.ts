import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { finishStudySession } from "@/lib/data/learning";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** POST /api/study/sessions/[id]/finish */
export const POST = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireUser(request);
    finishStudySession(user.id, params.id);
    return json({ ok: true });
  }
);
