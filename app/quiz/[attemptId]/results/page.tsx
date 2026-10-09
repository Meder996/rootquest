"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { MasteryRing } from "@/components/dashboard/mastery-ring";
import { cn } from "@/lib/utils";

interface ResultOption {
  id: string;
  text: string;
  is_correct: number;
}

interface ResultQuestion {
  id: string;
  type: string;
  prompt: string;
  passage: string | null;
  explanation: string | null;
  options: ResultOption[];
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeMs: number | null;
}

interface Results {
  attempt: {
    id: string;
    mode: string;
    score: number;
    total: number;
    duration_seconds: number | null;
    completed_at: string | null;
  };
  questions: ResultQuestion[];
  score: number;
  total: number;
  accuracy: number;
  xp: number;
  newAchievements: { id: string; code: string; name: string; xpBonus: number }[];
  durationSeconds: number;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function QuizResultsPage() {
  const params = useParams<{ attemptId: string }>();
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/quiz/${params.attemptId}/results`)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || "Could not load these results.");
          return;
        }
        setResults(await res.json());
      })
      .catch(() => setError("Could not load these results."));
    return () => {
      cancelled = true;
    };
  }, [params.attemptId]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Card className="py-10">
          <p className="mb-4 text-coral">{error}</p>
          <Link href="/quiz">
            <Button>Start a new quiz</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!results) return <Spinner label="Loading results…" className="min-h-[50vh]" />;

  const { score, total, accuracy } = results;
  const pct = Math.round(accuracy * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      {/* ---------------------------------------------------------- summary */}
      <Card className="animate-scale-in text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow to-coral text-white shadow-glow-coral">
          <Trophy className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-extrabold">Quiz complete</h1>
        <p className="mt-1 text-sm capitalize text-muted">{results.attempt.mode} quiz</p>

        <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <MasteryRing value={pct} size={132} label={`${score}/${total}`} />
        </div>

        <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card p-4">
            <p className="font-display text-2xl font-extrabold text-turquoise">{pct}%</p>
            <p className="text-xs text-muted">accuracy</p>
          </div>
          <div className="rounded-2xl bg-card p-4">
            <p className="font-display text-2xl font-extrabold text-yellow">+{results.xp}</p>
            <p className="text-xs text-muted">XP earned</p>
          </div>
          <div className="rounded-2xl bg-card p-4">
            <p className="font-display text-2xl font-extrabold text-violet">
              {results.durationSeconds != null
                ? formatDuration(results.durationSeconds)
                : "—"}
            </p>
            <p className="text-xs text-muted">time</p>
          </div>
        </div>

        <ProgressBar value={score} max={total} className="mx-auto mt-6 max-w-lg" label="Score" />

        {results.newAchievements.length > 0 && (
          <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-yellow/40 bg-yellow/10 p-4 text-left">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              New achievements unlocked
            </p>
            <ul className="flex flex-col gap-1">
              {results.newAchievements.map((a) => (
                <li key={a.id} className="text-sm">
                  <span className="font-semibold">{a.name}</span>
                  <span className="text-muted"> · +{a.xpBonus} XP</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/quiz">
            <Button className="gap-2">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Another quiz
            </Button>
          </Link>
          <Link href="/review">
            <Button variant="secondary" className="gap-2">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Review mistakes
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              Dashboard
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* ------------------------------------------------------ question review */}
      <h2 className="mb-4 mt-10 font-display text-2xl font-bold">Review your answers</h2>
      <div className="flex flex-col gap-4">
        {results.questions.map((question, index) => (
          <Card key={question.id}>
            {question.passage && (
              <blockquote className="mb-3 rounded-xl border-l-4 border-violet/50 bg-surface px-4 py-2.5 text-sm text-muted">
                {question.passage}
              </blockquote>
            )}
            <div className="mb-3 flex items-start justify-between gap-3">
              <p className="font-semibold">
                {index + 1}. {question.prompt}
              </p>
              <Badge tone={question.isCorrect ? "success" : "coral"}>
                {question.isCorrect ? "Correct" : "Missed"}
              </Badge>
            </div>
            <ul className="flex flex-col gap-2">
              {question.options.map((option) => {
                const isCorrect = option.is_correct === 1;
                const isSelected = question.selectedOptionId === option.id;
                return (
                  <li
                    key={option.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm",
                      isCorrect && "border-success/50 bg-success/10",
                      isSelected && !isCorrect && "border-coral/50 bg-coral/10",
                      !isCorrect && !isSelected && "border-border bg-surface text-muted"
                    )}
                  >
                    <span>{option.text}</span>
                    <span className="flex items-center gap-2">
                      {isSelected && (
                        <Badge tone={isCorrect ? "success" : "coral"}>
                          {isCorrect ? "Your answer" : "Your answer"}
                        </Badge>
                      )}
                      {isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                      )}
                      {isSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 text-coral" aria-hidden="true" />
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
            {question.explanation && (
              <p className="mt-3 rounded-xl bg-card px-4 py-3 text-sm text-muted">
                <span className="font-semibold text-text">Explanation: </span>
                {question.explanation}
              </p>
            )}
            {question.timeMs != null && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Answered in {(question.timeMs / 1000).toFixed(1)}s
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
