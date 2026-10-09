import { NextRequest } from "next/server";
import { ApiError } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import { getPublishedWordPart, getRelatedParts, getWordsForPart } from "@/lib/data/library";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/guards";
import type { UserWordProgress } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/word-parts/[id] — details, examples, related parts, user progress. */
export const GET = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const part = getPublishedWordPart(params.id);
    if (!part) throw new ApiError(404, "Word part not found.");
    const words = getWordsForPart(part.id);
    const related = getRelatedParts(part);

    // Personal progress is only attached for the authenticated owner.
    let progress: UserWordProgress | null = null;
    const ctx = await getSessionUser();
    if (ctx) {
      progress =
        db.get<UserWordProgress>(
          "SELECT * FROM user_word_progress WHERE user_id = ? AND word_part_id = ?",
          ctx.user.id,
          part.id
        ) ?? null;
    }

    // Related questions (published) for the mini-check.
    const questions = db.all(
      `SELECT id, type, prompt, difficulty FROM questions
       WHERE status = 'published' AND related_part_id = ? LIMIT 3`,
      part.id
    );

    return json({ part, words, related, progress, questions });
  }
);
