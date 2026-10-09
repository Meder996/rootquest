"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ShieldCheck, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, xpLevel } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: number;
  created_at: string;
  xp: number;
  total_reviews: number;
  current_streak: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUserId(data.user.id);
      });
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setIsLoading(false);
  }, [search, roleFilter]);

  useEffect(() => {
    const handle = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(handle);
  }, [load, search]);

  async function changeRole(user: AdminUser, role: string) {
    if (role === user.role) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) load();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              aria-label="Search users"
              className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-text placeholder:text-muted/60 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
            />
          </div>
          <Select
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="sm:w-40"
          >
            <option value="">All roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </Select>
        </div>
        <p className="mt-3 text-xs text-muted">{users.length} users</p>
      </Card>

      {isLoading ? (
        <Spinner label="Loading users…" className="py-20" />
      ) : users.length === 0 ? (
        <EmptyState icon={User} title="No users found" description="Try a different search." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="pb-3 pr-4 font-semibold">User</th>
                <th className="pb-3 pr-4 font-semibold">Joined</th>
                <th className="pb-3 pr-4 font-semibold">Level</th>
                <th className="pb-3 pr-4 font-semibold">Reviews</th>
                <th className="pb-3 pr-4 font-semibold">Streak</th>
                <th className="pb-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet/10 text-violet">
                        <User className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {user.name}
                          {user.id === currentUserId && (
                            <span className="ml-2 text-xs text-muted">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted">{formatDate(user.created_at)}</td>
                  <td className="py-3 pr-4 font-semibold">L{xpLevel(user.xp)}</td>
                  <td className="py-3 pr-4">{user.total_reviews}</td>
                  <td className="py-3 pr-4">{user.current_streak} days</td>
                  <td className="py-3">
                    {user.id === currentUserId ? (
                      <Badge tone={user.role === "admin" ? "violet" : "muted"}>
                        {user.role === "admin" && (
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {user.role}
                      </Badge>
                    ) : (
                      <Select
                        label="Change role"
                        value={user.role}
                        onChange={(e) => changeRole(user, e.target.value)}
                        className="w-36"
                      >
                        <option value="student">student</option>
                        <option value="admin">admin</option>
                      </Select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
