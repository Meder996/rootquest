"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface QuizQuestion {
  id: string;
  type: string;
  prompt: string;
  passage: string | null;
  difficulty: string;
  category: string | null;
  explanation: string | null;
  options: QuizOption[];
  selectedOptionId: string | null;
  isCorrect: boolean;
}

interface AttemptInfo {
  id: string;
  mode: string;
  questionCount: number;
  timed?: boolean;
}

interface Feedback {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string | null;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function QuizRunnerPage() {
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const attemptId = params.attemptId;

  const [attempt, setAttempt] = useState<AttemptInfo | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const questionStartRef = useRef<number>(Date.now());

  // ------------------------------------------------------- load / resume --
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/quiz/${attemptId}/results`);
      if (cancelled) return;
      if (res.status === 401 || res.status === 404) {
        setLoadError("This quiz could not be found. It may belong to another account.");
        return;
      }
      if (!res.ok) {
        setLoadError("Could not load this quiz. Please try again.");
        return;
      }
      const data = await res.json();
      if (data.attempt.completed_at) {
        router.replace(`/quiz/${attemptId}/results`);
        return;
      }
      const loaded: QuizQuestion[] = data.questions.map((q: QuizQuestion) => ({
        ...q,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
      }));
      setQuestions(loaded);
      setAttempt({
        id: data.attempt.id,
        mode: data.attempt.mode,
        questionCount: data.attempt.question_count,
      });
      // Resume at the first unanswered question.
      const firstUnanswered = loaded.findIndex((q) => q.selectedOptionId === null);
      const startIndex = firstUnanswered === -1 ? 0 : firstUnanswered;
      setCurrentIndex(startIndex);
      if (loaded[startIndex]?.selectedOptionId) {
        setFeedback({
          isCorrect: loaded[startIndex].isCorrect,
          correctOptionId:
            loaded[startIndex].options.find((o) => o.isCorrect)?.id ?? "",
          explanation: loaded[startIndex].explanation,
        });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [attemptId, router]);

  const current = questions[currentIndex];

  // ------------------------------------------------------------- timer --
  useEffect(() => {
    if (!attempt || timeLeft === null) return;
    if (timeLeft <= 0) {
      finish();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => (t === null ? null : t - 1)), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, timeLeft === null]);

  useEffect(() => {
    if (attempt && attempt.questionCount && timeLeft === null) {
      setTimeLeft(attempt.questionCount * 45);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // Reset per-question state on navigation.
  useEffect(() => {
    questionStartRef.current = Date.now();
    if (current?.selectedOptionId) {
      setSelected(current.selectedOptionId);
      setFeedback({
        isCorrect: current.isCorrect,
        correctOptionId: current.options.find((o) => o.isCorrect)?.id ?? "",
        explanation: current.explanation,
      });
    } else {
      setSelected(null);
      setFeedback(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions.length]);

  // ---------------------------------------------------------- answering --
  async function submitAnswer(optionId: string) {
    if (!current || feedback || isSubmitting) return;
    setIsSubmitting(true);
    setSelected(optionId);
    try {
      const timeMs = Date.now() - questionStartRef.current;
      const res = await fetch(`/api/quiz/${attemptId}/answer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: current.id, optionId, timeMs }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setFeedback({
          isCorrect: data.isCorrect,
          correctOptionId: data.correctOptionId,
          explanation: data.explanation,
        });
        // Persist the answer locally so a refresh resumes correctly.
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === current.id
              ? {
                  ...q,
                  selectedOptionId: optionId,
                  isCorrect: data.isCorrect,
                  options: q.options.map((o) => ({
                    ...o,
                    isCorrect: o.id === data.correctOptionId,
                  })),
                }
              : q
          )
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const finish = useCallback(async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      await fetch(`/api/quiz/${attemptId}/finish`, { method: "POST" });
    } finally {
      router.push(`/quiz/${attemptId}/results`);
    }
  }, [attemptId, isFinishing, router]);

  function next() {
    if (currentIndex + 1 >= questions.length) {
      finish();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // ----------------------------------------------------------- keyboard --
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!current) return;
      if (feedback) {
        if (event.key === "Enter") {
          event.preventDefault();
          next();
        }
        return;
      }
      const index = Number(event.key) - 1;
      if (index >= 0 && index < current.options.length) {
        event.preventDefault();
        submitAnswer(current.options[index].id);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, feedback, currentIndex, questions.length]);

  // ------------------------------------------------------- report question --
  async function submitReport() {
    if (!current || !reportMessage.trim()) return;
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        reportedQuestionId: current.id,
        subject: "Question report",
        message: reportMessage.trim(),
      }),
    });
    setReportSent(true);
  }

  // ------------------------------------------------------------- render --
  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Card className="py-10">
          <p className="mb-4 text-coral">{loadError}</p>
          <Link href="/quiz">
            <Button>Start a new quiz</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!attempt || !current) {
    return <Spinner label="Loading quiz…" className="min-h-[50vh]" />;
  }

  const answeredCount = questions.filter((q) => q.selectedOptionId !== null).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* ---------------------------------------------------------- header */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 text-sm text-muted">
          <span className="font-semibold capitalize">{attempt.mode} quiz</span>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <span
                className={cn(
                  "flex items-center gap-1.5 font-mono font-semibold",
                  timeLeft <= 30 ? "text-coral" : "text-yellow"
                )}
              >
                <Clock className="h-4 w-4" aria-hidden="true" />
                {formatTime(timeLeft)}
              </span>
            )}
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted hover:text-coral"
              onClick={finish}
              disabled={isFinishing}
            >
              Exit &amp; save
            </Button>
          </div>
        </div>
        <ProgressBar value={answeredCount} max={questions.length} />
      </div>

      {/* --------------------------------------------------------- question */}
      <Card className="animate-fade-up">
        {current.passage && (
          <blockquote className="mb-5 rounded-xl border-l-4 border-violet/50 bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            {current.passage}
          </blockquote>
        )}
        <h2 className="mb-6 font-display text-xl font-bold leading-snug">
          {current.prompt}
        </h2>

        <div className="grid gap-3" role="group" aria-label="Answer choices">
          {current.options.map((option, index) => {
            const isSelected = selected === option.id;
            const isCorrectOption = feedback?.correctOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={!!feedback || isSubmitting}
                onClick={() => submitAnswer(option.id)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left font-medium transition-all",
                  "disabled:cursor-default",
                  !feedback &&
                    "border-border bg-surface hover:border-violet hover:bg-card",
                  !feedback && isSelected && "border-violet bg-violet/10",
                  feedback && isCorrectOption && "border-success/60 bg-success/10 text-success",
                  feedback &&
                    isSelected &&
                    !isCorrectOption &&
                    "border-coral/60 bg-coral/10 text-coral",
                  feedback &&
                    !isSelected &&
                    !isCorrectOption &&
                    "border-border bg-surface opacity-60"
                )}
              >
                <span>
                  <span className="mr-2.5 font-mono text-sm text-muted">{index + 1}</span>
                  {option.text}
                </span>
                {feedback && isCorrectOption && (
                  <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                )}
                {feedback && isSelected && !isCorrectOption && (
                  <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------- feedback */}
        {feedback && (
          <div
            className={cn(
              "mt-5 flex animate-scale-in flex-col gap-3 rounded-2xl border px-4 py-4",
              feedback.isCorrect
                ? "border-success/40 bg-success/10"
                : "border-coral/40 bg-coral/10"
            )}
          >
            <p
              className={cn(
                "flex items-center gap-2 font-bold",
                feedback.isCorrect ? "text-success" : "text-coral"
              )}
            >
              {feedback.isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Correct!
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" aria-hidden="true" /> Not quite
                </>
              )}
            </p>
            {feedback.explanation && (
              <p className="text-sm leading-relaxed text-muted">{feedback.explanation}</p>
            )}
            <Button onClick={next} className="mt-1 self-start gap-2">
              {currentIndex + 1 >= questions.length ? "Finish quiz" : "Next question"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {/* ------------------------------------------------------- report */}
        <div className="mt-5 border-t border-border pt-4">
          {reportOpen ? (
            <div className="flex flex-col gap-2">
              {reportSent ? (
                <p className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Thanks — your report was submitted.
                </p>
              ) : (
                <>
                  <Textarea
                    label="Report this question"
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    placeholder="What is wrong or confusing about this question?"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={submitReport} disabled={!reportMessage.trim()}>
                      Send report
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReportOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-coral"
            >
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />
              Report this question
            </button>
          )}
        </div>
      </Card>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        Keyboard: press 1–4 to answer, Enter for the next question.
      </p>
    </div>
  );
}
