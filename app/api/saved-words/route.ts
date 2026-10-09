import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { evaluateAchievements, incrementWordsSaved } from "@/lib/gamification";
import { savedWordSchema } from "@/lib/validation/schemas";
import { nowIso, uid } from "@/lib/utils";
import type { Word, WordPart } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/saved-words — the user's saved words. */
export const GET = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  const words = db.all<Word & { part_text: string; part_type: string; saved_at: string }>(
    `SELECT w.*, p.text AS part_text, p.type AS part_type, s.saved_at
     FROM saved_words s
     JOIN words w ON w.id = s.word_id
     JOIN word_parts p ON p.id = w.word_part_id
     WHERE s.user_id = ?
     ORDER BY s.saved_at DESC`,
    user.id
  );
  return json({ words });
});

/** POST /api/saved-words — save a word. */
export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  const body = savedWordSchema.parse(await parseJsonBody(request));
  const word = db.get<Word>(
    "SELECT id FROM words WHERE id = ? AND status = 'published'",
    body.wordId
  );
  if (!word) throw new ApiError(404, "Word not found.");
  const existing = db.get(
    "SELECT 1 AS x FROM saved_words WHERE user_id = ? AND word_id = ?",
    user.id,
    body.wordId
  );
  if (!existing) {
    db.run(
      "INSERT INTO saved_words (user_id, word_id, saved_at) VALUES (?, ?, ?)",
      user.id,
      body.wordId,
      nowIso()
    );
    incrementWordsSaved(user.id, 1);
    evaluateAchievements(user.id);
  }
  return json({ ok: true });
});
