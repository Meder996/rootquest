import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { handleApi, json, parseJsonBody, publicUser } from "@/lib/api-helpers";
import { profileUpdateSchema } from "@/lib/validation/schemas";
import { nowIso } from "@/lib/utils";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/profile */
export const GET = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  return json({ user: publicUser(user) });
});

/** PATCH /api/profile — update name, daily goal, SAT date, timezone, preferences. */
export const PATCH = handleApi(async (request: NextRequest) => {
  const { user } = await requireUser(request);
  const body = profileUpdateSchema.parse(await parseJsonBody(request));

  const sets: string[] = [];
  const params: unknown[] = [];
  if (body.name !== undefined) {
    sets.push("name = ?");
    params.push(body.name);
  }
  if (body.dailyGoal !== undefined) {
    sets.push("daily_goal = ?");
    params.push(body.dailyGoal);
  }
  if (body.satDate !== undefined) {
    sets.push("sat_date = ?");
    params.push(body.satDate);
  }
  if (body.timezone !== undefined) {
    sets.push("timezone = ?");
    params.push(body.timezone);
  }
  if (body.preferences !== undefined) {
    const current = db.get<{ preferences: string }>(
      "SELECT preferences FROM profiles WHERE id = ?",
      user.id
    );
    let prefs: Record<string, boolean> = {};
    try {
      prefs = current?.preferences ? JSON.parse(current.preferences) : {};
    } catch {
      prefs = {};
    }
    sets.push("preferences = ?");
    params.push(JSON.stringify({ ...prefs, ...body.preferences }));
  }
  sets.push("updated_at = ?");
  params.push(nowIso(), user.id);

  db.run(`UPDATE profiles SET ${sets.join(", ")} WHERE id = ?`, ...params);
  const updated = db.get("SELECT * FROM profiles WHERE id = ?", user.id)!;
  return json({ user: publicUser(updated as never) });
});
