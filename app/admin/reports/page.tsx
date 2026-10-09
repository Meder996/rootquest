"use client";

import { useEffect, useState } from "react";
import { Activity, BarChart3, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

interface Reports {
  totals: {
    users: number;
    activeToday: number;
    reviewsToday: number;
    quizzesCompleted: number;
  };
  signupsLast7Days: { date: string; n: number }[];
  reviewsLast7Days: { date: string; n: number }[];
  quizStats: {
    attempts: number;
    avgScore: number;
    avgTotal: number;
    avgAccuracy: number;
  };
  topParts: { text: string; type: string; n: number }[];
  masteryDistribution: { status: string; n: number }[];
  recentFeedback: {
    id: string;
    subject: string | null;
    message: string;
    status: string;
    created_at: string;
    user_email: string | null;
  }[];
}

function MiniBarChart({
  data,
  label,
}: {
  data: { date: string; n: number }[];
  label: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.n));
  const width = 280;
  const height = 80;
  const barWidth = data.length > 0 ? (width - (data.length - 1) * 4) / data.length : 0;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={label}>
      {data.map((day, index) => {
        const h = Math.max(2, (day.n / max) * (height - 16));
        const x = index * (barWidth + 4);
        return (
          <g key={day.date}>
            <rect x={x} y={height - h - 14} width={barWidth} height={h} rx={3} className="fill-turquoise/70">
              <title>
                {day.date}: {day.n}
              </title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={height - 2}
              textAnchor="middle"
              className="fill-muted"
              fontSize={8}
            >
              {day.date.slice(5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Reports | null>(null);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then(setReports);
  }, []);

  if (!reports) return <Spinner label="Loading reports…" className="py-24" />;

  const masteryTotal = reports.masteryDistribution.reduce((sum, r) => sum + r.n, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: reports.totals.users, icon: Users, tone: "bg-violet/10 text-violet" },
          { label: "Active today", value: reports.totals.activeToday, icon: Activity, tone: "bg-turquoise/10 text-turquoise" },
          { label: "Reviews today", value: reports.totals.reviewsToday, icon: TrendingUp, tone: "bg-yellow/10 text-yellow" },
          { label: "Quizzes completed", value: reports.totals.quizzesCompleted, icon: BarChart3, tone: "bg-coral/10 text-coral" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold">{value.toLocaleString()}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg font-bold">Signups — last 7 days</h2>
          {reports.signupsLast7Days.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No signups in the last 7 days.</p>
          ) : (
            <MiniBarChart data={reports.signupsLast7Days} label="Signups per day, last 7 days" />
          )}
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-lg font-bold">Reviews — last 7 days</h2>
          {reports.reviewsLast7Days.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No reviews in the last 7 days.</p>
          ) : (
            <MiniBarChart data={reports.reviewsLast7Days} label="Reviews per day, last 7 days" />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg font-bold">Quiz performance</h2>
          {reports.quizStats.attempts === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No completed quizzes yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl bg-card p-3">
                  <p className="font-display text-xl font-extrabold">{reports.quizStats.attempts}</p>
                  <p className="text-xs text-muted">attempts</p>
                </div>
                <div className="rounded-2xl bg-card p-3">
                  <p className="font-display text-xl font-extrabold">
                    {reports.quizStats.avgScore.toFixed(1)}/{reports.quizStats.avgTotal.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted">avg score</p>
                </div>
                <div className="rounded-2xl bg-card p-3">
                  <p className="font-display text-xl font-extrabold">{reports.quizStats.avgAccuracy}%</p>
                  <p className="text-xs text-muted">avg accuracy</p>
                </div>
              </div>
              <ProgressBar
                value={reports.quizStats.avgAccuracy}
                max={100}
                label="Average accuracy"
              />
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold">Most studied parts</h2>
          {reports.topParts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No study activity yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {reports.topParts.map((part) => (
                <li
                  key={part.text}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                >
                  <span className="font-display font-bold">{part.text}</span>
                  <Badge tone="muted">{part.n} reviews</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-display text-lg font-bold">Mastery distribution (all students)</h2>
        {masteryTotal === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No progress recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.masteryDistribution.map((row) => (
              <div key={row.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold capitalize">{row.status}</span>
                  <span className="text-muted">
                    {row.n} · {Math.round((row.n / masteryTotal) * 100)}%
                  </span>
                </div>
                <ProgressBar value={row.n} max={masteryTotal} label={`${row.status} count`} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg font-bold">Recent feedback</h2>
        {reports.recentFeedback.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No feedback yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.recentFeedback.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{item.subject || "Feedback"}</span>
                  <Badge
                    tone={
                      item.status === "new"
                        ? "yellow"
                        : item.status === "resolved"
                          ? "success"
                          : "muted"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted">{item.message}</p>
                <p className="mt-2 text-xs text-muted">
                  {item.user_email ?? "Anonymous"} · {formatDate(item.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
