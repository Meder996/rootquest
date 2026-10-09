import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Landmark,
  Lightbulb,
  Quote,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import {
  getPublishedWordPart,
  getRelatedParts,
  getWordsForPart,
} from "@/lib/data/library";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, DifficultyBadge, PartTypeBadge, StatusBadge } from "@/components/ui/badge";
import { SaveWordButton } from "@/components/learn/save-word-button";
import { MiniCheck } from "@/components/learn/mini-check";
import type { UserWordProgress, Word } from "@/types";

export const dynamic = "force-dynamic";

export default async function WordPartPage({ params }: { params: { id: string } }) {
  const part = getPublishedWordPart(params.id);
  if (!part) notFound();

  const words = getWordsForPart(part.id);
  const related = getRelatedParts(part);
  const ctx = await getSessionUser();

  let progress: UserWordProgress | null = null;
  let savedWordIds = new Set<string>();
  if (ctx) {
    progress =
      db.get<UserWordProgress>(
        "SELECT * FROM user_word_progress WHERE user_id = ? AND word_part_id = ?",
        ctx.user.id,
        part.id
      ) ?? null;
    savedWordIds = new Set(
      db
        .all<{ word_id: string }>(
          "SELECT word_id FROM saved_words WHERE user_id = ?",
          ctx.user.id
        )
        .map((r) => r.word_id)
    );
  }

  const questions = db.all<{ id: string; type: string; prompt: string; difficulty: string }>(
    `SELECT id, type, prompt, difficulty FROM questions
     WHERE status = 'published' AND related_part_id = ? LIMIT 3`,
    part.id
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/learn"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-turquoise"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to library
      </Link>

      {/* ------------------------------------------------------------ header */}
      <Card className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <PartTypeBadge type={part.type} />
              <DifficultyBadge difficulty={part.difficulty} />
              {part.category && <Badge tone="muted">{part.category}</Badge>}
              {part.origin && (
                <Badge tone="muted">
                  <Landmark className="h-3 w-3" aria-hidden="true" />
                  {part.origin}
                </Badge>
              )}
              {progress && <StatusBadge status={progress.status} />}
            </div>
            <h1 className="mt-4 font-display text-5xl font-extrabold text-gradient">
              {part.text}
            </h1>
            <p className="mt-2 font-display text-2xl font-bold text-turquoise">
              {part.meaning}
            </p>
            {part.description && (
              <p className="mt-4 max-w-2xl leading-relaxed text-muted">
                {part.description}
              </p>
            )}
            {part.visual_mnemonic && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-yellow/30 bg-yellow/10 px-4 py-3 text-sm text-yellow">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Mnemonic:</strong> {part.visual_mnemonic}
                </span>
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <Link href={`/study/flashcards?scope=all&partId=${part.id}`}>
              <Button className="w-full gap-2">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Study flashcards
              </Button>
            </Link>
            <Link href={`/quiz?partId=${part.id}`}>
              <Button variant="secondary" className="w-full gap-2">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                Quiz me
              </Button>
            </Link>
          </div>
        </div>

        {progress && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-center sm:grid-cols-4">
            <div>
              <p className="font-display text-xl font-bold">{progress.correct_count}</p>
              <p className="text-xs text-muted">correct</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold">{progress.incorrect_count}</p>
              <p className="text-xs text-muted">incorrect</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold">{progress.streak}</p>
              <p className="text-xs text-muted">streak</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold capitalize">{progress.status}</p>
              <p className="text-xs text-muted">status</p>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* ------------------------------------------------------ examples */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-display text-xl font-bold">Example words</h2>
            {words.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {words.map((word: Word) => (
                  <li
                    key={word.id}
                    className="rounded-2xl border border-border bg-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-lg font-bold">{word.word}</span>
                          <DifficultyBadge difficulty={word.difficulty} />
                        </div>
                        <p className="mt-1 text-sm font-medium text-turquoise">
                          {word.definition}
                        </p>
                      </div>
                      {ctx && (
                        <SaveWordButton
                          wordId={word.id}
                          initiallySaved={savedWordIds.has(word.id)}
                        />
                      )}
                    </div>
                    {word.sentence && (
                      <p className="mt-2 flex items-start gap-2 text-sm italic text-muted">
                        <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {word.sentence}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No example words published yet.</p>
            )}
          </Card>
        </div>

        {/* -------------------------------------------------- related + quiz */}
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-4 font-display text-xl font-bold">Related parts</h2>
            {related.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {related.map((relatedPart) => (
                  <li key={relatedPart.id}>
                    <Link href={`/learn/${relatedPart.id}`}>
                      <Badge
                        tone="muted"
                        className="cursor-pointer px-3 py-1.5 text-sm hover:border-violet hover:text-violet"
                      >
                        {relatedPart.text}
                        <span className="ml-1 text-muted">· {relatedPart.meaning}</span>
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No related parts yet.</p>
            )}
          </Card>

          <Card>
            <MiniCheck questions={questions} partId={part.id} />
          </Card>
        </div>
      </div>
    </div>
  );
}
