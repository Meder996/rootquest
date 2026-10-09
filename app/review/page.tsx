"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, Flame, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Flashcard, type FlashcardItem } from "@/components/flashcards/flashcard";
import { RatingButtons } from "@/components/flashcards/rating-buttons";
import { cn } from "@/lib/utils";
import type { ReviewRating } from "@/types";

type Tab = "due" | "mistakes";

export default function ReviewPage() {
  const [tab, setTab] = useState<Tab>("due");
  const [items, setItems] = useState<FlashcardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [fixed, setFixed] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isRating, setIsRating] = useState(false);

  const load = useCallback(async (nextTab: Tab) => {
    setIsLoading(true);
    setCurrentIndex(0);
    setFlipped(false);
    setReviewed(0);
    setFixed(0);
    setXpEarned(0);
    try {
      const res = await fetch(
        `/api/study/items?scope=${nextTab === "mistakes" ? "mistakes" : "due"}&limit=100`
      );
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  const current = items[currentIndex];

  async function handleRate(rating: ReviewRating) {
    if (!current || isRating || !flipped) return;
    setIsRating(true);
    try {
      const res = await fetch("/api/study/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wordPartId: current.part.id, rating }),
      });
      if (res.ok) {
        const data = await res.json();
        setXpEarned((xp) => xp + data.xp);
        if (rating === "good" || rating === "easy") setFixed((n) => n + 1);
        setReviewed((n) => n + 1);
        if (currentIndex + 1 < items.length) {
          setCurrentIndex((i) => i + 1);
          setFlipped(false);
        }
      }
    } finally {
      setIsRating(false);
    }
  }

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
          <h1 className="font-display text-3xl font-extrabold">Review Queue</h1>
          <p className="mt-1 text-sm text-muted">
            Your spaced-repetition schedule and your mistakes, all in one place.
          </p>
        </div>
        <div className="flex gap-2">
          {(["due", "mistakes"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition-all",
                tab === t
                  ? "border-violet bg-violet/15 text-violet"
                  : "border-border bg-card text-muted hover:border-violet/50 hover:text-text"
              )}
            >
              {t === "due" ? "Due now" : "Mistakes"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Loading your review queue…" className="py-24" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={tab === "due" ? "Nothing due right now" : "No mistakes to review"}
          description={
            tab === "due"
              ? "You are fully caught up. Come back after your next study session."
              : "Great — you have not missed anything recently. Keep it up."
          }
          action={
            <Link href="/study/flashcards?scope=all">
              <Button variant="secondary" className="gap-2">
                <Layers className="h-4 w-4" aria-hidden="true" />
                Study everything
              </Button>
            </Link>
          }
        />
      ) : reviewed >= items.length ? (
        <Card className="animate-scale-in py-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-success to-turquoise text-white">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="font-display text-3xl font-extrabold">Review complete</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            You reviewed {reviewed} card{reviewed === 1 ? "" : "s"} and got {fixed} right
            this round.
          </p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-4">
            <div className="rounded-2xl bg-card p-4">
              <p className="font-display text-2xl font-extrabold text-turquoise">{fixed}</p>
              <p className="text-xs text-muted">rated correct</p>
            </div>
            <div className="rounded-2xl bg-card p-4">
              <p className="font-display text-2xl font-extrabold text-yellow">+{xpEarned}</p>
              <p className="text-xs text-muted">XP earned</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => load(tab)} className="gap-2">
              <Flame className="h-4 w-4" aria-hidden="true" />
              Review again
            </Button>
            <Link href="/quiz?mode=review">
              <Button variant="secondary" className="gap-2">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Quiz my mistakes
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        current && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>
                  Card {currentIndex + 1} of {items.length}
                </span>
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-coral">
                    <Flame className="h-4 w-4" aria-hidden="true" />
                    {fixed} fixed
                  </span>
                  <span className="flex items-center gap-1 text-yellow">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />+{xpEarned} XP
                  </span>
                </span>
              </div>
              <ProgressBar value={reviewed} max={items.length} />
            </div>

            <div className="animate-fade-up">
              <Flashcard item={current} onFlip={setFlipped} />
            </div>

            <RatingButtons onRate={handleRate} disabled={!flipped || isRating} />
          </div>
        )
      )}
    </div>
  );
}
