import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { wordSchema } from "@/lib/validation/schemas";
import { logAdminAction } from "@/lib/admin/audit";
import { nowIso } from "@/lib/utils";
import type { Word } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

function getWordOr404(id: string): Word {
  const word = db.get<Word>("SELECT * FROM words WHERE id = ?", id);
  if (!word) throw new ApiError(404, "Word not found.");
  return word;
}

/** GET /api/admin/words/[id] */
export const GET = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin(request);
    return json({ word: getWordOr404(params.id) });
  }
);

/** PATCH /api/admin/words/[id] */
export const PATCH = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    getWordOr404(params.id);
    const body = wordSchema.partial().parse(await parseJsonBody(request));
    const sets: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, unknown> = {
      word_part_id: body.wordPartId,
      word: body.word,
      definition: body.definition,
      sentence: body.sentence ?? null,
      pronunciation: body.pronunciation ?? null,
      difficulty: body.difficulty,
      status: body.status,
    };
    for (const [column, value] of Object.entries(map)) {
      if (value !== undefined) {
        sets.push(`${column} = ?`);
        values.push(value);
      }
    }
    if (sets.length === 0) return json({ word: getWordOr404(params.id) });
    db.run(
      `UPDATE words SET ${sets.join(", ")} WHERE id = ?`,
      ...values,
      params.id
    );
    logAdminAction(user.id, "word.update", "word", params.id, { word: body.word });
    return json({ word: getWordOr404(params.id) });
  }
);

/** DELETE /api/admin/words/[id] — archive. */
export const DELETE = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    const existing = getWordOr404(params.id);
    db.run("UPDATE words SET status = 'archived' WHERE id = ?", params.id);
    logAdminAction(user.id, "word.archive", "word", params.id, { word: existing.word });
    return json({ ok: true });
  }
);
