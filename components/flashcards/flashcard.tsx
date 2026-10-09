"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Quote, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, DifficultyBadge, PartTypeBadge, StatusBadge } from "@/components/ui/badge";
import type { UserWordProgress, Word, WordPart } from "@/types";

export interface FlashcardItem {
  part: WordPart;
  words: Word[];
  progress: UserWordProgress | null;
  dueReason: string;
}

/** Flip card: front shows the part, back shows meaning, mnemonic, and examples. */
export function Flashcard({
  item,
  onFlip,
}: {
  item: FlashcardItem;
  onFlip?: (flipped: boolean) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const { part, words, progress } = item;

  useEffect(() => {
    setFlipped(false);
  }, [part.id]);

  function flip() {
    const next = !flipped;
    setFlipped(next);
    onFlip?.(next);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        flip();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={flipped ? "Show the word part" : "Show the meaning"}
      className="block h-full w-full text-left [perspective:1400px]"
    >
      <div
        className={cn(
          "relative h-full min-h-[340px] w-full transition-all duration-500 [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* Front */}
        <div className="card-surface absolute inset-0 flex flex-col items-center justify-center gap-4 [backface-visibility:hidden]">
          <div className="flex items-center gap-2">
            <PartTypeBadge type={part.type} />
            <DifficultyBadge difficulty={part.difficulty} />
            {progress && <StatusBadge status={progress.status} />}
          </div>
          <span className="font-display text-6xl font-extrabold text-gradient">
            {part.text}
          </span>
          <span className="text-sm text-muted">What does it mean?</span>
          <span className="flex items-center gap-1.5 text-xs text-muted/70">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Click or press Space to flip
          </span>
        </div>

        {/* Back */}
        <div className="card-surface absolute inset-0 flex flex-col gap-3 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PartTypeBadge type={part.type} />
              {part.origin && <Badge tone="muted">{part.origin}</Badge>}
            </div>
            <span className="font-display text-xl font-bold text-turquoise">
              {part.meaning}
            </span>
          </div>
          {part.description && (
            <p className="text-sm leading-relaxed text-muted">{part.description}</p>
          )}
          {part.visual_mnemonic && (
            <p className="flex items-start gap-2 rounded-xl border border-yellow/30 bg-yellow/10 px-3 py-2 text-xs text-yellow">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {part.visual_mnemonic}
            </p>
          )}
          {words.length > 0 && (
            <ul className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
              {words.slice(0, 3).map((word) => (
                <li key={word.id} className="text-sm">
                  <span className="font-semibold text-text">{word.word}</span>
                  <span className="text-muted"> — {word.definition}</span>
                  {word.sentence && (
                    <p className="mt-0.5 flex items-start gap-1.5 text-xs italic text-muted">
                      <Quote className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                      {word.sentence}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </button>
  );
}
