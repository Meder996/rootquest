"use client";

import { useState } from "react";
import { Lightbulb, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Interactive sample word-part card for the landing page.
 * Click (or press Enter/Space) to flip between the part and its meaning.
 */
export function SampleCard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="w-full max-w-sm animate-float-slow">
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((v) => !v);
          }
        }}
        aria-label={flipped ? "Show the word part" : "Show the meaning"}
        className="group relative block h-64 w-full [perspective:1200px]"
      >
        <div
          className={cn(
            "relative h-full w-full transition-all duration-500 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]"
          )}
        >
          {/* Front */}
          <div className="card-surface absolute inset-0 flex flex-col items-center justify-center gap-4 [backface-visibility:hidden] group-hover:border-violet/50">
            <Badge tone="turquoise">Prefix</Badge>
            <span className="font-display text-5xl font-extrabold text-gradient">trans-</span>
            <span className="text-sm text-muted">Tap to see what it means</span>
            <RotateCcw className="h-4 w-4 text-muted" aria-hidden="true" />
          </div>
          {/* Back */}
          <div className="card-surface absolute inset-0 flex flex-col items-center justify-center gap-3 [backface-visibility:hidden] [transform:rotateY(180deg)] group-hover:border-turquoise/50">
            <span className="font-display text-3xl font-bold text-turquoise">
              across; through
            </span>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Lightbulb className="h-4 w-4 text-yellow" aria-hidden="true" />
              A transcript is carried across to a new school.
            </div>
            <span className="rounded-xl bg-card px-3 py-1.5 font-semibold text-text">
              transport — to carry across
            </span>
          </div>
        </div>
      </button>
      <p className="mt-3 text-center text-xs text-muted">
        This is a real RootQuest card — flip it, then start your own garden.
      </p>
    </div>
  );
}
