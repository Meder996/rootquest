import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { wordSchema } from "@/lib/validation/schemas";
import { logAdminAction } from "@/lib/admin/audit";
import { nowIso, uid } from "@/lib/utils";
import type { Word, WordPart } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

interface WordRow extends Word {
  part_text: string;
}

/** GET /api/admin/words — example words, optionally filtered by part. */
export const GET = handleApi(async (request: NextRequest) => {
  await requireAdmin(request);
  const params = request.nextUrl.searchParams;
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (params.get("partId")) {
    conditions.push("w.word_part_id = ?");
    values.push(params.get("partId"));
  }
  if (params.get("search")) {
    conditions.push("w.word LIKE ?");
    values.push(`%${params.get("search")}%`);
  }
  if (params.get("status")) {
    conditions.push("w.status = ?");
    values.push(params.get("status"));
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(Number(params.get("limit")) || 200, 500);
  const words = db.all<WordRow>(
    `SELECT w.*, p.text AS part_text FROM words w
     JOIN word_parts p ON p.id = w.word_part_id
     ${where} ORDER BY w.word LIMIT ?`,
    ...values,
    limit
  );
  return json({ words });
});

/** POST /api/admin/words — add an example word to a part. */
export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireAdmin(request);
  const body = wordSchema.parse(await parseJsonBody(request));
  const part = db.get<WordPart>(
    "SELECT id FROM word_parts WHERE id = ?",
    body.wordPartId
  );
  if (!part) throw new (await import("@/lib/auth/guards")).ApiError(404, "Word part not found.");
  const id = uid();
  db.run(
    `INSERT INTO words
      (id, word_part_id, word, definition, sentence, pronunciation, difficulty, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    body.wordPartId,
    body.word,
    body.definition,
    body.sentence ?? null,
    body.pronunciation ?? null,
    body.difficulty,
    body.status ?? "draft"
  );
  logAdminAction(user.id, "word.create", "word", id, { word: body.word });
  const word = db.get<Word>("SELECT * FROM words WHERE id = ?", id)!;
  return json({ word }, { status: 201 });
});
