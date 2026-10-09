import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApi, json } from "@/lib/api-helpers";
import type { AdminAuditLogEntry } from "@/types";

/** This route reads cookies / query params — always dynamic. */
export const dynamic = "force-dynamic";

/** GET /api/admin/audit-log — administrative action history. */
export const GET = handleApi(async (request: NextRequest) => {
  await requireAdmin(request);
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 100, 500);
  const entries = db.all<AdminAuditLogEntry & { admin_email: string }>(
    `SELECT a.*, p.email AS admin_email FROM admin_audit_log a
     JOIN profiles p ON p.id = a.admin_id
     ORDER BY a.created_at DESC LIMIT ?`,
    limit
  );
  return json({ entries });
});
