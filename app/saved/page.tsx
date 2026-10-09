"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkX, Quote, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, DifficultyBadge, PartTypeBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";

interface SavedWord {
  id: string;
  word: string;
  definition: string;
  sentence: string | null;
  difficulty: string;
  word_part_id: string;
  part_text: string;
  part_type: string;
  saved_at: string;
}

export default function SavedWordsPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/saved-words")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => setWords(data.words))
      .finally(() => setIsLoading(false));
  }, []);

  async function unsave(wordId: string) {
    const res = await fetch(`/api/saved-words/${wordId}`, { method: "DELETE" });
    if (res.ok) setWords((prev) => prev.filter((w) => w.id !== wordId));
  }

  const filtered = words.filter(
    (w) =>
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.definition.toLowerCase().includes(search.toLowerCase()) ||
      w.part_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-turquoise"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Saved Words</h1>
          <p className="mt-1 text-muted">
            {words.length} word{words.length === 1 ? "" : "s"} in your collection.
          </p>
        </div>
        {words.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved words…"
              aria-label="Search saved words"
              className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-text placeholder:text-muted/60 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <Spinner label="Loading saved words…" className="py-24" />
      ) : words.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Bookmark}
            title="No saved words yet"
            description="While studying, tap the bookmark icon on any example word to save it here."
            action={
              <Link href="/learn">
                <Button variant="secondary">Browse the library</Button>
              </Link>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="mt-6 py-10 text-center text-sm text-muted">
          No saved words match “{search}”.
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((word) => (
            <Card key={word.id} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PartTypeBadge type={word.part_type} />
                  <DifficultyBadge difficulty={word.difficulty} />
                </div>
                <button
                  type="button"
                  onClick={() => unsave(word.id)}
                  aria-label={`Unsave ${word.word}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted transition-colors hover:border-coral/50 hover:text-coral"
                >
                  <BookmarkX className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <Link href={`/learn/${word.word_part_id}`} className="group">
                <h3 className="font-display text-2xl font-extrabold group-hover:text-turquoise">
                  {word.word}
                </h3>
              </Link>
              <p className="mt-1 text-sm font-medium text-turquoise">{word.definition}</p>
              {word.sentence && (
                <p className="mt-2 flex items-start gap-2 text-xs italic text-muted">
                  <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {word.sentence}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
                <Link href={`/learn/${word.word_part_id}`} className="hover:text-turquoise hover:underline">
                  Built from <Badge tone="muted">{word.part_text}</Badge>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
