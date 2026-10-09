import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { wordPartSchema } from "@/lib/validation/schemas";
import { logAdminAction } from "@/lib/admin/audit";
import { nowIso } from "@/lib/utils";
import type { WordPart } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

function getPartOr404(id: string): WordPart {
  const part = db.get<WordPart>("SELECT * FROM word_parts WHERE id = ?", id);
  if (!part) throw new ApiError(404, "Word part not found.");
  return part;
}

/** GET /api/admin/word-parts/[id] */
export const GET = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin(request);
    return json({ part: getPartOr404(params.id) });
  }
);

/** PATCH /api/admin/word-parts/[id] — edit fields and/or status. */
export const PATCH = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    const existing = getPartOr404(params.id);
    const body = wordPartSchema.partial().parse(await parseJsonBody(request));
    const sets: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, unknown> = {
      text: body.text,
      type: body.type,
      meaning: body.meaning,
      description: body.description ?? null,
      origin: body.origin ?? null,
      difficulty: body.difficulty,
      category: body.category ?? null,
      visualMnemonic: body.visualMnemonic ?? null,
      status: body.status,
    };
    for (const [key, value] of Object.entries(map)) {
      if (value !== undefined) {
        const column = key === "visualMnemonic" ? "visual_mnemonic" : key;
        sets.push(`${column} = ?`);
        values.push(value);
      }
    }
    sets.push("updated_at = ?");
    values.push(nowIso(), params.id);
    db.run(`UPDATE word_parts SET ${sets.join(", ")} WHERE id = ?`, ...values);
    const action =
      body.status && body.status !== existing.status
        ? `word_part.${body.status}`
        : "word_part.update";
    logAdminAction(user.id, action, "word_part", params.id, {
      text: body.text ?? existing.text,
      status: body.status ?? existing.status,
    });
    return json({ part: getPartOr404(params.id) });
  }
);

/** DELETE /api/admin/word-parts/[id] — archive (soft delete). */
export const DELETE = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    const existing = getPartOr404(params.id);
    db.run(
      "UPDATE word_parts SET status = 'archived', updated_at = ? WHERE id = ?",
      nowIso(),
      params.id
    );
    logAdminAction(user.id, "word_part.archive", "word_part", params.id, {
      text: existing.text,
    });
    return json({ ok: true });
  }
);
