import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin/audit";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

const schema = z.object({ status: z.enum(["new", "reviewed", "resolved"]) });

/** PATCH /api/admin/feedback/[id] — update feedback status. */
export const PATCH = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    const existing = db.get("SELECT id FROM feedback WHERE id = ?", params.id);
    if (!existing) throw new ApiError(404, "Feedback not found.");
    const body = schema.parse(await parseJsonBody(request));
    db.run("UPDATE feedback SET status = ? WHERE id = ?", body.status, params.id);
    logAdminAction(user.id, "feedback.update", "feedback", params.id, {
      status: body.status,
    });
    return json({ ok: true });
  }
);
