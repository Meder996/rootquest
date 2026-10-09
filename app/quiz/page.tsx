"use client";

import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, GraduationCap, Layers, Shuffle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface LessonOption {
  lesson: { id: string; title: string; category: string | null };
}

export default function QuizSetupPage() {
  return (
    <Suspense fallback={<Spinner label="Loading…" className="min-h-[50vh]" />}>
      <QuizSetupPageContent />
    </Suspense>
  );
}

function QuizSetupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState(searchParams.get("mode") ?? "mixed");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [lessonId, setLessonId] = useState(searchParams.get("lessonId") ?? "");
  const [timed, setTimed] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/word-parts?limit=1").then((res) =>
      res.json().then((data) => setCategories(data.categories ?? []))
    );
    fetch("/api/lessons").then((res) =>
      res.json().then((data) => setLessons(data.lessons ?? []))
    );
  }, []);

  // If a partId is provided, quiz that part specifically.
  const partId = searchParams.get("partId");

  async function onStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsStarting(true);
    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: partId ? "lesson" : mode,
          category: mode === "category" && category ? category : null,
          difficulty: mode === "difficulty" && difficulty ? difficulty : null,
          lessonId: partId ? null : mode === "lesson" && lessonId ? lessonId : null,
          count,
          timed,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not start the quiz.");
      router.push(`/quiz/${body.attempt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the quiz.");
      setIsStarting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-turquoise"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow to-coral text-white shadow-glow-coral">
          <GraduationCap className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-extrabold">SAT Arena</h1>
        <p className="mx-auto mt-2 max-w-lg text-muted">
          {partId
            ? "A focused quiz on this word part. Answer every question to see your results."
            : "Configure a quiz below — mixed, by category, by difficulty, or by lesson."}
        </p>
      </div>

      <Card className="mt-8">
        <form onSubmit={onStart} className="flex flex-col gap-5">
          {!partId && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Quiz mode" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="mixed">Mixed — a bit of everything</option>
                  <option value="category">By category</option>
                  <option value="difficulty">By difficulty</option>
                  <option value="lesson">By lesson</option>
                  <option value="review">Review my mistakes</option>
                </Select>
                <Select
                  label="Questions"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                >
                  <option value={5}>5 questions</option>
                  <option value={10}>10 questions</option>
                  <option value={20}>20 questions</option>
                  <option value={30}>30 questions</option>
                </Select>
              </div>

              {mode === "category" && (
                <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Choose a category…</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </Select>
              )}

              {mode === "difficulty" && (
                <Select
                  label="Difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  required
                >
                  <option value="">Choose a difficulty…</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              )}

              {mode === "lesson" && (
                <Select label="Lesson" value={lessonId} onChange={(e) => setLessonId(e.target.value)} required>
                  <option value="">Choose a lesson…</option>
                  {lessons.map(({ lesson }) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </Select>
              )}
            </>
          )}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={timed}
              onChange={(e) => setTimed(e.target.checked)}
              className="h-4 w-4 accent-violet"
            />
            <span className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4 text-yellow" aria-hidden="true" />
              Timed mode
            </span>
            <span className="text-muted">— {count} questions, 45 seconds each</span>
          </label>

          {error && (
            <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" isLoading={isStarting} className="gap-2 self-start">
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Start quiz
          </Button>
        </form>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Target,
            title: "Instant feedback",
            description: "Every answer comes with an explanation right away.",
          },
          {
            icon: Layers,
            title: "Mistakes reviewed",
            description: "Missed questions land in your review queue automatically.",
          },
          {
            icon: Clock,
            title: "Timed or relaxed",
            description: "Practice at your own pace or under SAT-like time pressure.",
          },
        ].map((feature) => (
          <Card key={feature.title} className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet/10 text-violet">
              <feature.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-1 text-xs text-muted">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
