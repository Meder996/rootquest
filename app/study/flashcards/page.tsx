"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Flame,
  Layers,
  Library,
  ListChecks,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Flashcard, type FlashcardItem } from "@/components/flashcards/flashcard";
import { RatingButtons } from "@/components/flashcards/rating-buttons";
import { cn } from "@/lib/utils";
import type { ReviewRating } from "@/types";

type Scope = "due" | "new" | "mistakes" | "all";

const scopes: { value: Scope; label: string; description: string }[] = [
  { value: "due", label: "Due now", description: "Items your spaced-repetition schedule says to review" },
  { value: "mistakes", label: "Mistakes", description: "Parts you have missed — the Error Laboratory" },
  { value: "new", label: "New", description: "Parts you have never studied" },
  { value: "all", label: "Everything", description: "The whole published library" },
];

interface ReviewResponse {
  progress: {
    status: string;
    streak: number;
    correct_count: number;
    incorrect_count: number;
    next_review_at: string | null;
  };
  xp: number;
  newAchievements: { id: string; code: string; name: string; xpBonus: number }[];
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<Spinner label="Loading…" className="min-h-[50vh]" />}>
      <FlashcardsPageContent />
    </Suspense>
  );
}

function FlashcardsPageContent() {
  const searchParams = useSearchParams();
  const initialScope = (searchParams.get("scope") as Scope) || "due";
  const partIdFilter = searchParams.get("partId");

  const [scope, setScope] = useState<Scope>(initialScope);
  const [items, setItems] = useState<FlashcardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [newAchievements, setNewAchievements] = useState<ReviewResponse["newAchievements"]>([]);
  const [isRating, setIsRating] = useState(false);
  const [finished, setFinished] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  const load = useCallback(async (nextScope: Scope) => {
    setIsLoading(true);
    setFinished(false);
    setCurrentIndex(0);
    setRated(0);
    setXpEarned(0);
    setCorrectCount(0);
    setNewAchievements([]);
    try {
      const params = new URLSearchParams({ scope: nextScope, limit: "100" });
      if (partIdFilter) params.set("partId", partIdFilter);
      const res = await fetch(`/api/study/items?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
      // Start a study session for this run.
      const sessionRes = await fetch("/api/study/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "flashcards" }),
      });
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        sessionIdRef.current = sessionData.session.id;
      }
    } finally {
      setIsLoading(false);
    }
  }, [partIdFilter]);

  useEffect(() => {
    load(scope);
  }, [scope, load]);

  useEffect(() => {
    return () => {
      // End the session when leaving the page.
      if (sessionIdRef.current) {
        fetch(`/api/study/sessions/${sessionIdRef.current}/finish`, { method: "POST" }).catch(() => {});
      }
    };
  }, []);

  const current = items[currentIndex];

  async function handleRate(rating: ReviewRating) {
    if (!current || isRating || !flipped) return;
    setIsRating(true);
    try {
      const res = await fetch("/api/study/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wordPartId: current.part.id,
          rating,
          sessionId: sessionIdRef.current,
        }),
      });
      if (res.ok) {
        const data: ReviewResponse = await res.json();
        setXpEarned((xp) => xp + data.xp);
        if (rating === "good" || rating === "easy") {
          setCorrectCount((c) => c + 1);
        }
        if (data.newAchievements.length > 0) {
          setNewAchievements((prev) => [...prev, ...data.newAchievements]);
        }
        setRated((r) => r + 1);
        if (currentIndex + 1 >= items.length) {
          setFinished(true);
          if (sessionIdRef.current) {
            fetch(`/api/study/sessions/${sessionIdRef.current}/finish`, { method: "POST" }).catch(() => {});
          }
        } else {
          setCurrentIndex((i) => i + 1);
          setFlipped(false);
        }
      }
    } finally {
      setIsRating(false);
    }
  }

  const accuracy = rated > 0 ? Math.round((correctCount / rated) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-turquoise"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Flashcard Study</h1>
          <p className="mt-1 text-sm text-muted">
            Flip the card, recall the meaning, then rate yourself honestly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {scopes.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setScope(s.value)}
              title={s.description}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-semibold transition-all",
                scope === s.value
                  ? "border-violet bg-violet/15 text-violet"
                  : "border-border bg-card text-muted hover:border-violet/50 hover:text-text"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Loading your cards…" className="py-24" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={scope === "due" ? "Nothing due right now" : "No cards in this set"}
          description={
            scope === "due"
              ? "You are all caught up. Learn something new or take a quiz."
              : "Try a different set — everything else is waiting in the library."
          }
          action={
            <div className="flex gap-2">
              <Link href="/learn">
                <Button variant="secondary" className="gap-2">
                  <Library className="h-4 w-4" aria-hidden="true" />
                  Browse library
                </Button>
              </Link>
              <Link href="/quiz">
                <Button className="gap-2">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Take a quiz
                </Button>
              </Link>
            </div>
          }
        />
      ) : finished ? (
        /* ---------------------------------------------------- summary */
        <Card className="animate-scale-in py-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet to-turquoise text-white shadow-glow">
            <Trophy className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="font-display text-3xl font-extrabold">Session complete</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            You reviewed {rated} card{rated === 1 ? "" : "s"} in this session.
          </p>
          <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-4">
            <div className="rounded-2xl bg-card p-4">
              <p className="font-display text-2xl font-extrabold text-turquoise">{accuracy}%</p>
              <p className="text-xs text-muted">rated correct</p>
            </div>
            <div className="rounded-2xl bg-card p-4">
              <p className="font-display text-2xl font-extrabold text-yellow">+{xpEarned}</p>
              <p className="text-xs text-muted">XP earned</p>
            </div>
            <div className="rounded-2xl bg-card p-4">
              <p className="font-display text-2xl font-extrabold text-violet">{rated}</p>
              <p className="text-xs text-muted">cards reviewed</p>
            </div>
          </div>
          {newAchievements.length > 0 && (
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-yellow/40 bg-yellow/10 p-4 text-left">
              <p className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                New achievements
              </p>
              <ul className="flex flex-col gap-1">
                {newAchievements.map((a) => (
                  <li key={a.id} className="text-sm">
                    <span className="font-semibold">{a.name}</span>
                    <span className="text-muted"> · +{a.xpBonus} XP</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => load(scope)} className="gap-2">
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Study again
            </Button>
            <Link href="/quiz">
              <Button variant="secondary" className="gap-2">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Take a quiz
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* ------------------------------------------------------ the card */
        current && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>
                  Card {currentIndex + 1} of {items.length}
                  {partIdFilter ? " · filtered" : ""}
                </span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-coral">
                    <Flame className="h-4 w-4" aria-hidden="true" />
                    {correctCount} correct
                  </span>
                  <span className="flex items-center gap-1 text-yellow">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />+{xpEarned} XP
                  </span>
                </span>
              </div>
              <ProgressBar value={currentIndex} max={items.length} />
            </div>

            <div className="animate-fade-up">
              <Flashcard item={current} onFlip={setFlipped} />
            </div>

            {current.dueReason && (
              <p className="text-center text-xs text-muted">{current.dueReason}</p>
            )}

            <div className="flex flex-col gap-3">
              <p className="text-center text-sm font-medium text-muted">
                {flipped
                  ? "How well did you recall it?"
                  : "Flip the card, recall the meaning, then rate yourself."}
              </p>
              <RatingButtons onRate={handleRate} disabled={!flipped || isRating} />
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (currentIndex + 1 >= items.length) {
                    setFinished(true);
                  } else {
                    setRated((r) => r + 0);
                    setCurrentIndex((i) => i + 1);
                    setFlipped(false);
                  }
                }}
              >
                Skip this card
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
