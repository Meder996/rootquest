"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Filter, Library, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Badge, DifficultyBadge, PartTypeBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import type { WordPart } from "@/types";

interface LibraryResponse {
  parts: (WordPart & { related_parts?: string })[];
  total: number;
  categories: string[];
}

const typeFilters = [
  { value: "", label: "All types" },
  { value: "prefix", label: "Prefixes" },
  { value: "root", label: "Roots" },
  { value: "suffix", label: "Suffixes" },
];

const difficultyFilters = [
  { value: "", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function LearnPage() {
  return (
    <Suspense fallback={<Spinner label="Loading library…" className="min-h-[50vh]" />}>
      <LearnPageContent />
    </Suspense>
  );
}

function LearnPageContent() {
  const searchParams = useSearchParams();
  const [parts, setParts] = useState<WordPart[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");

  const load = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (difficulty) params.set("difficulty", difficulty);
    if (category) params.set("category", category);
    const res = await fetch(`/api/word-parts?${params.toString()}`);
    if (res.ok) {
      const data: LibraryResponse = await res.json();
      setParts(data.parts);
      setTotal(data.total);
      setCategories(data.categories);
    }
    setIsLoading(false);
  }, [search, type, difficulty, category]);

  useEffect(() => {
    const handle = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(handle);
  }, [load, search]);

  const grouped = useMemo(() => {
    const byType: Record<string, WordPart[]> = { prefix: [], root: [], suffix: [] };
    for (const part of parts) {
      (byType[part.type] ??= []).push(part);
    }
    return byType;
  }, [parts]);

  const sections: { type: string; title: string; tone: "turquoise" | "violet" | "coral"; parts: WordPart[] }[] = [
    { type: "prefix", title: "Prefixes", tone: "turquoise", parts: grouped.prefix },
    { type: "root", title: "Roots", tone: "violet", parts: grouped.root },
    { type: "suffix", title: "Suffixes", tone: "coral", parts: grouped.suffix },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Word-Part Library</h1>
          <p className="mt-1 text-muted">
            {total} published parts — search, filter, and open any card to study it.
          </p>
        </div>
        <Link href="/study/flashcards?scope=all">
          <Button variant="secondary" className="gap-2">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Study the library
          </Button>
        </Link>
      </div>

      {/* ------------------------------------------------------------ filters */}
      <Card className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parts, meanings…"
              aria-label="Search word parts"
              className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-text placeholder:text-muted/60 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
            />
          </div>
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            {typeFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
          <Select
            label="Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {difficultyFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        {(search || type || difficulty || category) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setType("");
              setDifficulty("");
              setCategory("");
            }}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-turquoise hover:underline"
          >
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </Card>

      {/* ------------------------------------------------------------- grid */}
      {isLoading ? (
        <Spinner label="Loading library…" className="py-20" />
      ) : parts.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Library}
            title="No word parts found"
            description="Try a different search term or clear the filters."
          />
        </div>
      ) : type || difficulty || category || search ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {parts.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      ) : (
        sections.map(
          (section) =>
            section.parts.length > 0 && (
              <section key={section.type} className="mt-8">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="font-display text-xl font-bold">{section.title}</h2>
                  <Badge tone={section.tone}>{section.parts.length}</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {section.parts.map((part) => (
                    <PartCard key={part.id} part={part} />
                  ))}
                </div>
              </section>
            )
        )
      )}
    </div>
  );
}

function PartCard({ part }: { part: WordPart }) {
  return (
    <Link href={`/learn/${part.id}`} className="group block">
      <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:border-violet/50">
        <div className="mb-3 flex items-center justify-between">
          <PartTypeBadge type={part.type} />
          <DifficultyBadge difficulty={part.difficulty} />
        </div>
        <h3 className="font-display text-2xl font-extrabold text-gradient">{part.text}</h3>
        <p className="mt-1 font-medium text-text">{part.meaning}</p>
        {part.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
            {part.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <span className="capitalize">{part.category ?? "general"}</span>
          <span className="font-semibold text-turquoise group-hover:underline">
            Study
          </span>
        </div>
      </Card>
    </Link>
  );
}
