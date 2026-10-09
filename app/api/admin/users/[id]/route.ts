import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, ApiError } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody } from "@/lib/api-helpers";
import { userRoleSchema } from "@/lib/validation/schemas";
import { logAdminAction } from "@/lib/admin/audit";
import { nowIso } from "@/lib/utils";
import type { Profile } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** PATCH /api/admin/users/[id] — change a user's role (audited). */
export const PATCH = handleApi(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { user } = await requireAdmin(request);
    if (user.id === params.id) {
      throw new ApiError(400, "You cannot change your own role.");
    }
    const target = db.get<Profile>("SELECT * FROM profiles WHERE id = ?", params.id);
    if (!target) throw new ApiError(404, "User not found.");
    const body = userRoleSchema.parse(await parseJsonBody(request));
    db.run(
      "UPDATE profiles SET role = ?, updated_at = ? WHERE id = ?",
      body.role,
      nowIso(),
      params.id
    );
    logAdminAction(user.id, "user.role_change", "user", params.id, {
      from: target.role,
      to: body.role,
      email: target.email,
    });
    const updated = db.get<Profile>("SELECT * FROM profiles WHERE id = ?", params.id)!;
    return json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
      },
    });
  }
);
