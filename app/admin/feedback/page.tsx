"use client";

import { useCallback, useEffect, useState } from "react";
import { Flag, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

interface FeedbackItem {
  id: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  user_email: string | null;
  reported_question_id: string | null;
}

const statusTone: Record<string, "yellow" | "turquoise" | "success"> = {
  new: "yellow",
  reviewed: "turquoise",
  resolved: "success",
};

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/feedback?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.feedback);
    }
    setIsLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(item: FeedbackItem, status: string) {
    const res = await fetch(`/api/admin/feedback/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{items.length} feedback items</p>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <Spinner label="Loading feedback…" className="py-20" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No feedback"
          description="Student feedback and question reports will appear here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{item.subject || "Feedback"}</h3>
                  {item.reported_question_id && (
                    <Badge tone="coral">
                      <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                      Question report
                    </Badge>
                  )}
                </div>
                <Badge tone={statusTone[item.status]}>{item.status}</Badge>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {item.message}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <p className="text-xs text-muted">
                  {item.user_email ?? "Anonymous"} · {formatDate(item.created_at)}
                </p>
                <Select
                  label="Set status"
                  value={item.status}
                  onChange={(e) => setStatus(item, e.target.value)}
                  className="w-40"
                >
                  <option value="new">new</option>
                  <option value="reviewed">reviewed</option>
                  <option value="resolved">resolved</option>
                </Select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
