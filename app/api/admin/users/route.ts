import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import type { Profile, UserStats } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

interface UserRow extends Profile {
  xp: number;
  total_reviews: number;
  current_streak: number;
}

/** GET /api/admin/users — user list with stats. */
export const GET = handleApi(async (request: NextRequest) => {
  await requireAdmin(request);
  const params = request.nextUrl.searchParams;
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (params.get("search")) {
    conditions.push("(p.email LIKE ? OR p.name LIKE ?)");
    values.push(`%${params.get("search")}%`, `%${params.get("search")}%`);
  }
  if (params.get("role")) {
    conditions.push("p.role = ?");
    values.push(params.get("role"));
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const users = db.all<UserRow>(
    `SELECT p.id, p.email, p.name, p.role, p.daily_goal, p.sat_date, p.timezone,
            p.email_verified, p.preferences, p.created_at, p.updated_at,
            COALESCE(s.xp, 0) AS xp, COALESCE(s.total_reviews, 0) AS total_reviews,
            COALESCE(s.current_streak, 0) AS current_streak
     FROM profiles p
     LEFT JOIN user_stats s ON s.user_id = p.id
     ${where}
     ORDER BY p.created_at DESC
     LIMIT 200`,
    ...values
  );
  return json({ users });
});
