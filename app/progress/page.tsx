"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, CalendarDays, Flame, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { MasteryRing } from "@/components/dashboard/mastery-ring";
import { formatDate, xpLevel } from "@/lib/utils";

interface Analytics {
  stats: {
    xp: number;
    current_streak: number;
    longest_streak: number;
    total_correct: number;
    total_incorrect: number;
    study_days: number;
    level: number;
  };
  accuracy: number;
  averageQuizScore: number;
  dailyActivity: { date: string; reviews: number; xp: number }[];
  masteryDistribution: Record<string, number>;
  categoryBreakdown: {
    category: string;
    totalParts: number;
    masteredParts: number;
    correct: number;
    incorrect: number;
    accuracy: number;
  }[];
  quizHistory: {
    id: string;
    mode: string;
    score: number;
    total: number;
    accuracy: number;
    completed_at: string;
  }[];
}

const masteryOrder: [string, string, string][] = [
  ["new", "New", "muted"],
  ["learning", "Learning", "coral"],
  ["familiar", "Familiar", "yellow"],
  ["strong", "Strong", "turquoise"],
  ["mastered", "Mastered", "violet"],
];

export default function ProgressPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const { stats } = data ?? { stats: null };
  const level = stats ? (stats.level ?? xpLevel(stats.xp)) : 1;
  const masteredTotal = data?.masteryDistribution.mastered ?? 0;
  const studiedTotal = data
    ? Object.values(data.masteryDistribution).reduce((a, b) => a + b, 0)
    : 0;

  // 14-day activity chart.
  const activity = data?.dailyActivity ?? [];
  const maxReviews = Math.max(1, ...activity.map((d) => d.reviews));
  const chartWidth = 560;
  const chartHeight = 120;
  const barWidth = activity.length > 0 ? (chartWidth - (activity.length - 1) * 6) / activity.length : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-turquoise"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <h1 className="font-display text-3xl font-extrabold">Your Progress</h1>
      <p className="mt-1 text-muted">Everything you have accomplished, in one view.</p>

      {!data ? (
        <Spinner label="Loading your progress…" className="py-24" />
      ) : (
        <ProgressPageContent
          data={data}
          level={level}
          masteredTotal={masteredTotal}
          studiedTotal={studiedTotal}
          activity={activity}
          maxReviews={maxReviews}
          barWidth={barWidth}
          chartWidth={chartWidth}
          chartHeight={chartHeight}
        />
      )}
    </div>
  );
}

function ProgressPageContent({
  data,
  level,
  masteredTotal,
  studiedTotal,
  activity,
  maxReviews,
  barWidth,
  chartWidth,
  chartHeight,
}: {
  data: Analytics;
  level: number;
  masteredTotal: number;
  studiedTotal: number;
  activity: Analytics["dailyActivity"];
  maxReviews: number;
  barWidth: number;
  chartWidth: number;
  chartHeight: number;
}) {
  const { stats } = data;
  return (
    <>
      <div>

      {/* ---------------------------------------------------------- overview */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet/10 text-violet">
            <Trophy className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold">Level {level}</p>
            <p className="text-xs text-muted">{stats.xp.toLocaleString()} XP total</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-coral/10 text-coral">
            <Flame className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold">{stats.current_streak}</p>
            <p className="text-xs text-muted">day streak · best {stats.longest_streak}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-turquoise/10 text-turquoise">
            <Target className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold">{data.accuracy}%</p>
            <p className="text-xs text-muted">overall accuracy</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow/10 text-yellow">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold">{data.averageQuizScore}%</p>
            <p className="text-xs text-muted">average quiz score</p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* ------------------------------------------------- activity chart */}
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Last 14 days</h2>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {stats.study_days} study days total
            </span>
          </div>
          {activity.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No activity yet — study a flashcard to get started.
            </p>
          ) : (
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full"
              role="img"
              aria-label="Reviews per day over the last 14 days"
            >
              {activity.map((day, index) => {
                const height = Math.max(2, (day.reviews / maxReviews) * (chartHeight - 24));
                const x = index * (barWidth + 6);
                const y = chartHeight - height - 18;
                return (
                  <g key={day.date}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx={4}
                      className="fill-violet/70"
                    >
                      <title>
                        {day.date}: {day.reviews} reviews, {day.xp} XP
                      </title>
                    </rect>
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      className="fill-muted"
                      fontSize={9}
                    >
                      {day.date.slice(5)}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </Card>

        {/* ---------------------------------------------- mastery distribution */}
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold">Mastery</h2>
          <div className="flex items-center gap-6">
            <MasteryRing
              value={studiedTotal > 0 ? Math.round((masteredTotal / studiedTotal) * 100) : 0}
              size={110}
              label={`${masteredTotal}`}
            />
            <ul className="flex-1 flex flex-col gap-2">
              {masteryOrder.map(([key, label, tone]) => (
                <li key={key} className="flex items-center justify-between text-sm">
                  <Badge tone={tone as never}>{label}</Badge>
                  <span className="font-semibold">{data.masteryDistribution[key] ?? 0}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-xs text-muted">
            {masteredTotal} of {studiedTotal} studied parts mastered · 130 parts in the
            library
          </p>
        </Card>
      </div>

      {/* ------------------------------------------------ category breakdown */}
      <Card className="mt-6">
        <h2 className="mb-4 font-display text-lg font-bold">Accuracy by category</h2>
        {data.categoryBreakdown.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Answer a few questions to see your per-category accuracy.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {data.categoryBreakdown.map((row) => (
              <div key={row.category}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold capitalize">{row.category}</span>
                  <span className="text-muted">
                    {row.masteredParts}/{row.totalParts} mastered · {row.accuracy}% correct
                  </span>
                </div>
                <ProgressBar
                  value={row.accuracy}
                  max={100}
                  label={`${row.category} accuracy`}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ------------------------------------------------------ quiz history */}
      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent quizzes</h2>
          <Link href="/quiz">
            <Button variant="ghost" size="sm">
              New quiz
            </Button>
          </Link>
        </div>
        {data.quizHistory.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            No completed quizzes yet. Take your first one in the SAT Arena.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4 font-semibold">Date</th>
                  <th className="pb-2 pr-4 font-semibold">Mode</th>
                  <th className="pb-2 pr-4 font-semibold">Score</th>
                  <th className="pb-2 font-semibold">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {data.quizHistory.map((quiz) => (
                  <tr key={quiz.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 text-muted">{formatDate(quiz.completed_at)}</td>
                    <td className="py-3 pr-4 capitalize">{quiz.mode}</td>
                    <td className="py-3 pr-4 font-semibold">
                      {quiz.score}/{quiz.total}
                    </td>
                    <td className="py-3">
                      <Badge tone={quiz.accuracy >= 70 ? "success" : "yellow"}>
                        {quiz.accuracy}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </div>
    </>
  );
}
