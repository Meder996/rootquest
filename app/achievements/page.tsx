"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { cn, formatDate, xpLevel } from "@/lib/utils";

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  earned: boolean;
  earnedAt: string | null;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/achievements")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => {
        setAchievements(data.achievements);
        setTotalXp(data.totalXp);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const earned = achievements.filter((a) => a.earned);
  const level = xpLevel(totalXp);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-turquoise"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Achievements</h1>
          <p className="mt-1 text-muted">
            Earn badges by studying, quizzing, and keeping your streak alive.
          </p>
        </div>
        {!isLoading && (
          <Card className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet/10 text-violet">
              <Trophy className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-xl font-extrabold">
                {earned.length} / {achievements.length}
              </p>
              <p className="text-xs text-muted">unlocked · Level {level}</p>
            </div>
          </Card>
        )}
      </div>

      {isLoading ? (
        <Spinner label="Loading achievements…" className="py-24" />
      ) : (
        <>
          <ProgressBar
            value={earned.length}
            max={achievements.length}
            className="mt-6"
            label="Achievements"
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={cn(
                  "transition-all duration-300",
                  achievement.earned
                    ? "border-yellow/30"
                    : "opacity-75 grayscale-[0.6] hover:opacity-100 hover:grayscale-0"
                )}
              >
                <div className="flex items-start gap-4">
                  <AchievementIcon
                    icon={achievement.icon}
                    earned={achievement.earned}
                    className="h-12 w-12 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-bold">{achievement.name}</h3>
                      {achievement.earned ? (
                        <Badge tone="yellow">+{achievement.xpReward} XP</Badge>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-muted">
                          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted">{achievement.description}</p>
                    {achievement.earned && achievement.earnedAt && (
                      <p className="mt-2 text-xs text-success">
                        Earned {formatDate(achievement.earnedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
