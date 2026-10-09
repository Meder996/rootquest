"use client";

import { useEffect } from "react";
import { RotateCcw, Zap, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewRating } from "@/types";

const buttons: {
  rating: ReviewRating;
  label: string;
  hint: string;
  key: string;
  className: string;
  icon: typeof RotateCcw;
}[] = [
  {
    rating: "again",
    label: "Again",
    hint: "Show it again soon",
    key: "1",
    className:
      "border-coral/40 bg-coral/10 text-coral hover:bg-coral/20 hover:border-coral",
    icon: RotateCcw,
  },
  {
    rating: "hard",
    label: "Hard",
    hint: "Soon — shorter interval",
    key: "2",
    className:
      "border-yellow/40 bg-yellow/10 text-yellow hover:bg-yellow/20 hover:border-yellow",
    icon: Zap,
  },
  {
    rating: "good",
    label: "Good",
    hint: "Normal spacing",
    key: "3",
    className:
      "border-turquoise/40 bg-turquoise/10 text-turquoise hover:bg-turquoise/20 hover:border-turquoise",
    icon: Check,
  },
  {
    rating: "easy",
    label: "Easy",
    hint: "Far into the future",
    key: "4",
    className:
      "border-violet/40 bg-violet/10 text-violet hover:bg-violet/20 hover:border-violet",
    icon: Sparkles,
  },
];

export function RatingButtons({
  onRate,
  disabled,
  className,
}: {
  onRate: (rating: ReviewRating) => void;
  disabled?: boolean;
  className?: string;
}) {
  useEffect(() => {
    if (disabled) return;
    function onKeyDown(event: KeyboardEvent) {
      const rating = buttons.find((b) => b.key === event.key)?.rating;
      if (rating) {
        event.preventDefault();
        onRate(rating);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, onRate]);

  return (
    <div
      className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3", className)}
      role="group"
      aria-label="Rate your recall"
    >
      {buttons.map(({ rating, label, hint, key, className: buttonClass, icon: Icon }) => (
        <button
          key={rating}
          type="button"
          disabled={disabled}
          onClick={() => onRate(rating)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 transition-all",
            "disabled:cursor-not-allowed disabled:opacity-50 active:scale-95",
            buttonClass
          )}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </span>
          <span className="text-xs opacity-70">{hint}</span>
          <kbd className="mt-0.5 rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px]">
            {key}
          </kbd>
        </button>
      ))}
    </div>
  );
}
