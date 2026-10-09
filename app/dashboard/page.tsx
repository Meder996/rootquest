import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Flame,
  Library,
  ListChecks,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth/guards";
import { getDashboardData } from "@/lib/data/dashboard";
import { getAchievementsWithStatus } from "@/lib/gamification";
import { formatDate, formatRelativeDue, xpIntoLevel, xpLevel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { MasteryRing } from "@/components/dashboard/mastery-ring";
import { AchievementIcon } from "@/components/achievements/achievement-icon";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ctx = await getSessionUser();
  if (!ctx) redirect("/auth/log-in?next=/dashboard");
  const { user } = ctx;
  const data = getDashboardData(user.id);
  const { achievements, earnedIds } = getAchievementsWithStatus(user.id);
  const earnedCount = achievements.filter((a) => earnedIds.has(a.id)).length;
  const level = xpLevel(data.stats.xp);
  const intoLevel = xpIntoLevel(data.stats.xp);

  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      {/* ---------------------------------------------------------- header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-muted">
            {data.dueCount > 0
              ? `You have ${data.dueCount} item${data.dueCount === 1 ? "" : "s"} due for review.`
              : "All caught up — time to learn something new."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/study/flashcards?scope=due">
            <Button className="gap-2">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Review due items
            </Button>
          </Link>
          <Link href="/learn">
            <Button variant="secondary" className="gap-2">
              <Library className="h-4 w-4" aria-hidden="true" />
              Browse library
            </Button>
          </Link>
        </div>
      </div>

      {/* -------------------------------------------------------- stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Study streak
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold text-coral">
                {data.stats.current_streak}
                <span className="ml-1 text-lg text-muted">days</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/15 text-coral">
              <Flame className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">
            Best streak: {data.stats.longest_streak} days
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Daily goal
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold text-turquoise">
                {data.todayReviews}
                <span className="ml-1 text-lg text-muted">/ {data.dailyGoal}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-turquoise/15 text-turquoise">
              <Target className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <ProgressBar value={data.todayReviews} max={data.dailyGoal} className="mt-3" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Due for review
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold text-violet">
                {data.dueCount}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet/15 text-violet">
              <ListChecks className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">
            Spaced repetition keeps mastery fresh
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Total XP · Level {level}
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold text-yellow">
                {data.stats.xp}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow/15 text-yellow">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <ProgressBar value={intoLevel} max={500} className="mt-3" />
        </Card>
      </div>

      {/* ------------------------------------------- chart + recommended etc */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your week</CardTitle>
            <p className="text-sm text-muted">Reviews and XP earned over the last 7 days.</p>
          </CardHeader>
          <WeeklyChart data={data.weeklyChart} />
        </Card>

        <Card className="flex flex-col items-center gap-4 text-center">
          <CardTitle className="w-full text-left">Mastery</CardTitle>
          <MasteryRing value={data.masteryPct} label="of library" />
          <div className="grid w-full grid-cols-5 gap-1 text-center">
            {(["new", "learning", "familiar", "strong", "mastered"] as const).map(
              (status) => (
                <div key={status} className="flex flex-col gap-1">
                  <span className="font-display text-lg font-bold">
                    {data.masteryDistribution[status] ?? 0}
                  </span>
                  <Badge tone="muted" className="justify-center">
                    {status}
                  </Badge>
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recommended lesson */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Continue learning</CardTitle>
          </CardHeader>
          {data.recommendedLesson ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Badge tone="violet">{data.recommendedLesson.lesson.category}</Badge>
                  <h3 className="mt-2 font-display text-xl font-bold">
                    {data.recommendedLesson.lesson.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {data.recommendedLesson.lesson.description}
                  </p>
                </div>
                <Link href={`/learn?lesson=${data.recommendedLesson.lesson.id}`}>
                  <Button className="gap-2">
                    Start lesson <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
              <ProgressBar
                value={data.recommendedLesson.masteredParts}
                max={data.recommendedLesson.totalParts}
                label={`${data.recommendedLesson.masteredParts} of ${data.recommendedLesson.totalParts} parts strong or mastered`}
              />
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="You have mastered every lesson"
              description="Every part in every lesson is strong or mastered. Take a quiz to keep it fresh."
              action={
                <Link href="/quiz">
                  <Button>Take a quiz</Button>
                </Link>
              }
            />
          )}
        </Card>

        {/* Recent achievements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent achievements</CardTitle>
              <Link href="/achievements">
                <span className="text-xs font-semibold text-turquoise hover:underline">
                  {earnedCount}/{achievements.length} earned
                </span>
              </Link>
            </div>
          </CardHeader>
          {data.recentAchievements.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {data.recentAchievements.map((achievement) => (
                <li key={achievement.id} className="flex items-center gap-3">
                  <AchievementIcon
                    icon={achievement.icon}
                    earned
                    className="h-10 w-10 rounded-xl"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{achievement.name}</p>
                    <p className="text-xs text-muted">
                      +{achievement.xp_bonus} XP · {formatDate(achievement.earned_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              No achievements yet — study a flashcard to earn your first one.
            </p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Weakest categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-coral" aria-hidden="true" />
              Focus areas
            </CardTitle>
            <p className="text-sm text-muted">
              Your weakest categories by answer accuracy — a great place to practice.
            </p>
          </CardHeader>
          {data.weakestCategories.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {data.weakestCategories.map((category) => (
                <li key={category.category}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{category.category}</span>
                    <span className="text-muted">
                      {category.accuracy}% · {category.reviews} answers
                    </span>
                  </div>
                  <ProgressBar value={category.accuracy} max={100} barClassName="from-coral to-yellow" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              Answer a few flashcards or quiz questions and your focus areas will
              appear here.
            </p>
          )}
        </Card>

        {/* Upcoming reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-turquoise" aria-hidden="true" />
              Upcoming reviews
            </CardTitle>
            <p className="text-sm text-muted">When your mastered items come back for maintenance.</p>
          </CardHeader>
          {data.upcomingReviews.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {data.upcomingReviews.map((review) => (
                <li key={review.partId} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-xl bg-card px-3 py-1.5 font-display text-sm font-bold text-gradient">
                      {review.text}
                    </span>
                    <Badge tone="muted">{review.status}</Badge>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {formatRelativeDue(review.nextReviewAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              Nothing scheduled yet — mastered items will appear here for occasional
              maintenance reviews.
            </p>
          )}
          <div className="mt-4">
            <Link href="/review">
              <Button variant="outline" className="w-full">
                Open review queue
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
