import crypto from "node:crypto";
import { db } from "@/lib/db";
import { nowIso, uid } from "@/lib/utils";

/** Issue a single-use token (password reset / email verification). */
export function createToken(table: "password_reset_tokens" | "email_verification_tokens", userId: string, ttlHours = 1): {
  token: string;
  expiresAt: string;
} {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
  db.run(
    `INSERT INTO ${table} (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    uid(),
    userId,
    tokenHash,
    expiresAt,
    nowIso()
  );
  return { token, expiresAt };
}

/** Consume a token; returns the user id when valid, null otherwise. */
export function consumeToken(
  table: "password_reset_tokens" | "email_verification_tokens",
  token: string
): string | null {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const row = db.get<{
    id: string;
    user_id: string;
    expires_at: string;
    used_at: string | null;
  }>(
    `SELECT id, user_id, expires_at, used_at FROM ${table} WHERE token_hash = ?`,
    tokenHash
  );
  if (!row || row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  db.run(`UPDATE ${table} SET used_at = ? WHERE id = ?`, nowIso(), row.id);
  return row.user_id;
}
