import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { wordPartSchema } from "@/lib/validation/schemas";
import { logAdminAction } from "@/lib/admin/audit";
import { nowIso, uid } from "@/lib/utils";
import type { WordPart } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/admin/word-parts — all parts including drafts. */
export const GET = handleApi(async (request: NextRequest) => {
  await requireAdmin(request);
  const params = request.nextUrl.searchParams;
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (params.get("search")) {
    conditions.push("(text LIKE ? OR meaning LIKE ?)");
    values.push(`%${params.get("search")}%`, `%${params.get("search")}%`);
  }
  if (params.get("type")) {
    conditions.push("type = ?");
    values.push(params.get("type"));
  }
  if (params.get("status")) {
    conditions.push("status = ?");
    values.push(params.get("status"));
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(Number(params.get("limit")) || 200, 500);
  const offset = Number(params.get("offset")) || 0;
  const parts = db.all<WordPart>(
    `SELECT * FROM word_parts ${where} ORDER BY type, category, text LIMIT ? OFFSET ?`,
    ...values,
    limit,
    offset
  );
  const total = db.get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM word_parts ${where}`,
    ...values
  )?.n ?? 0;
  return json({ parts, total });
});

/** POST /api/admin/word-parts — create a word part (draft by default). */
export const POST = handleApi(async (request: NextRequest) => {
  const { user } = await requireAdmin(request);
  const body = wordPartSchema.parse(await parseJsonBody(request));
  const id = uid();
  const status = body.status ?? "draft";
  db.run(
    `INSERT INTO word_parts
      (id, text, type, meaning, description, origin, difficulty, category, visual_mnemonic, related_parts, status, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?)`,
    id,
    body.text,
    body.type,
    body.meaning,
    body.description ?? null,
    body.origin ?? null,
    body.difficulty,
    body.category ?? null,
    body.visualMnemonic ?? null,
    status,
    user.id,
    nowIso(),
    nowIso()
  );
  logAdminAction(user.id, "word_part.create", "word_part", id, { text: body.text, status });
  const part = db.get<WordPart>("SELECT * FROM word_parts WHERE id = ?", id)!;
  return json({ part }, { status: 201 });
});
