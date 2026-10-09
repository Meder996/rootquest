import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/guards";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

/**
 * Admin layout — the server-side boundary for the console.
 * Middleware checks the JWT role claim, but the role is re-verified
 * against the database here (and in every /api/admin route).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const ctx = await getSessionUser();
  if (!ctx || ctx.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold">Admin Console</h1>
        <p className="mt-1 text-muted">
          Manage content, monitor the platform, and review feedback.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
