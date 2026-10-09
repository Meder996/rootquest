import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { evaluateAchievements, incrementWordsSaved } from "@/lib/gamification";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** DELETE /api/saved-words/[wordId] — unsave a word. */
export const DELETE = handleApi(
  async (request: NextRequest, { params }: { params: { wordId: string } }) => {
    const { user } = await requireUser(request);
    const result = db.run(
      "DELETE FROM saved_words WHERE user_id = ? AND word_id = ?",
      user.id,
      params.wordId
    );
    if (result.changes > 0) {
      incrementWordsSaved(user.id, -1);
      evaluateAchievements(user.id);
    }
    return json({ ok: true });
  }
);
