import { db } from "@/lib/db";
import { nowIso, uid } from "@/lib/utils";

/** Write an entry to the admin audit log. */
export function logAdminAction(
  adminId: string,
  action: string,
  targetType?: string | null,
  targetId?: string | null,
  details?: unknown
): void {
  db.run(
    `INSERT INTO admin_audit_log (id, admin_id, action, target_type, target_id, details, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    uid(),
    adminId,
    action,
    targetType ?? null,
    targetId ?? null,
    details ? JSON.stringify(details) : null,
    nowIso()
  );
}
