"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface DemoOption {
  id: string;
  text: string;
}

interface DemoQuestion {
  id: string;
  prompt: string;
  options: DemoOption[];
  correctOptionId: string;
  explanation: string | null;
}

export default function DemoQuizPage() {
  const [questions, setQuestions] = useState<DemoQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetch("/api/demo/questions?count=5")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (finished || !questions.length) return;
      const current = questions[currentIndex];
      if (!current) return;
      if (selected) {
        if (event.key === "Enter") {
          event.preventDefault();
          next();
        }
        return;
      }
      const index = Number(event.key) - 1;
      if (index >= 0 && index < current.options.length) {
        event.preventDefault();
        answer(current.options[index].id);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, selected, questions, finished]);

  function answer(optionId: string) {
    const current = questions[currentIndex];
    setSelected(optionId);
    setResults((prev) => [
      ...prev,
      { questionId: current.id, correct: optionId === current.correctOptionId },
    ]);
  }

  function next() {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  }

  function restart() {
    setIsLoading(true);
    fetch("/api/demo/questions?count=5")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setSelected(null);
        setResults([]);
        setFinished(false);
        setIsLoading(false);
      });
  }

  const current = questions[currentIndex];
  const score = results.filter((r) => r.correct).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow to-coral text-white shadow-glow-coral">
          <GraduationCap className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-extrabold">Sample Quiz</h1>
        <p className="mx-auto mt-2 max-w-lg text-muted">
          Five real SAT-style questions, no account needed. Your answers are not saved —
          sign up to track XP, streaks, and progress.
        </p>
      </div>

      {isLoading ? (
        <Spinner label="Loading sample questions…" className="py-24" />
      ) : questions.length === 0 ? (
        <Card className="py-10 text-center">
          <p className="mb-4 text-muted">The demo quiz is unavailable right now.</p>
          <Link href="/lesson/sample">
            <Button variant="secondary">Try the sample lesson</Button>
          </Link>
        </Card>
      ) : finished ? (
        <Card className="animate-scale-in py-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet to-turquoise text-white shadow-glow">
            <Trophy className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="font-display text-3xl font-extrabold">Demo complete</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            You answered <strong className="text-text">{score}</strong> of{" "}
            <strong className="text-text">{questions.length}</strong> correctly (
            {Math.round((score / questions.length) * 100)}%).
          </p>
          <ProgressBar
            value={score}
            max={questions.length}
            className="mx-auto mt-6 max-w-md"
            label="Score"
          />
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-violet/30 bg-violet/10 p-5 text-left">
            <p className="flex items-center gap-2 font-bold text-violet">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Like what you see?
            </p>
            <p className="mt-1 text-sm text-muted">
              Create a free account to unlock 1,300+ questions, spaced-repetition
              flashcards, achievements, and a personal progress dashboard.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Create your account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="gap-2" onClick={restart}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Demo quiz</span>
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <ProgressBar value={currentIndex} max={questions.length} />
          </div>

          <Card className="animate-fade-up">
            <h2 className="mb-6 font-display text-xl font-bold leading-snug">
              {current.prompt}
            </h2>
            <div className="grid gap-3">
              {current.options.map((option, index) => {
                const isSelected = selected === option.id;
                const isCorrect = option.id === current.correctOptionId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!!selected}
                    onClick={() => answer(option.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left font-medium transition-all",
                      "disabled:cursor-default",
                      !selected && "border-border bg-surface hover:border-violet hover:bg-card",
                      selected && isCorrect && "border-success/60 bg-success/10 text-success",
                      selected && isSelected && !isCorrect && "border-coral/60 bg-coral/10 text-coral",
                      selected && !isSelected && !isCorrect && "border-border bg-surface opacity-60"
                    )}
                  >
                    <span>
                      <span className="mr-2.5 font-mono text-sm text-muted">{index + 1}</span>
                      {option.text}
                    </span>
                    {selected && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                    )}
                    {selected && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
            {selected && (
              <div
                className={cn(
                  "mt-5 flex animate-scale-in flex-col gap-3 rounded-2xl border px-4 py-4",
                  selected === current.correctOptionId
                    ? "border-success/40 bg-success/10"
                    : "border-coral/40 bg-coral/10"
                )}
              >
                <p
                  className={cn(
                    "flex items-center gap-2 font-bold",
                    selected === current.correctOptionId ? "text-success" : "text-coral"
                  )}
                >
                  {selected === current.correctOptionId ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Correct!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" aria-hidden="true" /> Not quite
                    </>
                  )}
                </p>
                {current.explanation && (
                  <p className="text-sm leading-relaxed text-muted">{current.explanation}</p>
                )}
                <Button onClick={next} className="mt-1 self-start gap-2">
                  {currentIndex + 1 >= questions.length ? "See results" : "Next question"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </Card>

          <p className="text-center text-xs text-muted">
            Keyboard: press 1–4 to answer, Enter for the next question.
          </p>
        </div>
      )}
    </div>
  );
}
