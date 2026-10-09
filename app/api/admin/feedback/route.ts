import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/admin/feedback — submitted feedback. */
export const GET = handleApi(async (request: NextRequest) => {
  await requireAdmin(request);
  const status = request.nextUrl.searchParams.get("status");
  const rows = status
    ? db.all(
        `SELECT f.*, p.email AS user_email FROM feedback f
         LEFT JOIN profiles p ON p.id = f.user_id
         WHERE f.status = ? ORDER BY f.created_at DESC LIMIT 200`,
        status
      )
    : db.all(
        `SELECT f.*, p.email AS user_email FROM feedback f
         LEFT JOIN profiles p ON p.id = f.user_id
         ORDER BY f.created_at DESC LIMIT 200`
      );
  return json({ feedback: rows });
});
