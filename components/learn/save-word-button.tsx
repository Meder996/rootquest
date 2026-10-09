"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function SaveWordButton({
  wordId,
  initiallySaved,
  className,
}: {
  wordId: string;
  initiallySaved: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isLoading, setIsLoading] = useState(false);

  async function toggle() {
    setIsLoading(true);
    try {
      const res = await fetch(
        saved ? `/api/saved-words/${wordId}` : "/api/saved-words",
        {
          method: saved ? "DELETE" : "POST",
          headers: saved ? undefined : { "content-type": "application/json" },
          body: saved ? undefined : JSON.stringify({ wordId }),
        }
      );
      if (res.ok) setSaved(!saved);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isLoading}
      aria-pressed={saved}
      aria-label={saved ? "Unsave this word" : "Save this word"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
        saved
          ? "border-yellow/50 bg-yellow/10 text-yellow"
          : "border-border bg-card text-muted hover:border-yellow/50 hover:text-yellow",
        className
      )}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-current")} aria-hidden="true" />
    </button>
  );
}
