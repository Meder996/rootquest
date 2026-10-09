"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/admin/modal";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface AdminWord {
  id: string;
  word: string;
  definition: string;
  sentence: string | null;
  pronunciation: string | null;
  difficulty: string;
  status: string;
  word_part_id: string;
  part_text: string;
}

interface PartOption {
  id: string;
  text: string;
  type: string;
}

interface WordForm {
  wordPartId: string;
  word: string;
  definition: string;
  sentence: string;
  pronunciation: string;
  difficulty: string;
  status: string;
}

const emptyForm: WordForm = {
  wordPartId: "",
  word: "",
  definition: "",
  sentence: "",
  pronunciation: "",
  difficulty: "beginner",
  status: "draft",
};

const statusTone: Record<string, "success" | "yellow" | "muted"> = {
  published: "success",
  draft: "yellow",
  archived: "muted",
};

export default function AdminWordsPage() {
  const [words, setWords] = useState<AdminWord[]>([]);
  const [parts, setParts] = useState<PartOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [partFilter, setPartFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminWord | null>(null);
  const [form, setForm] = useState<WordForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminWord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/word-parts?limit=500")
      .then((res) => res.json())
      .then((data) =>
        setParts(data.parts.map((p: { id: string; text: string; type: string }) => ({
          id: p.id,
          text: p.text,
          type: p.type,
        })))
      );
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: "500" });
    if (search) params.set("search", search);
    if (partFilter) params.set("partId", partFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/words?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setWords(data.words);
    }
    setIsLoading(false);
  }, [search, partFilter, statusFilter]);

  useEffect(() => {
    const handle = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(handle);
  }, [load, search]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, wordPartId: partFilter || parts[0]?.id || "" });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(word: AdminWord) {
    setEditing(word);
    setForm({
      wordPartId: word.word_part_id,
      word: word.word,
      definition: word.definition,
      sentence: word.sentence ?? "",
      pronunciation: word.pronunciation ?? "",
      difficulty: word.difficulty,
      status: word.status,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        sentence: form.sentence || null,
        pronunciation: form.pronunciation || null,
      };
      const res = await fetch(
        editing ? `/api/admin/words/${editing.id}` : "/api/admin/words",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save the word.");
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the word.");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/admin/words/${deleteTarget.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (res.ok) {
      setDeleteTarget(null);
      load();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words…"
              aria-label="Search words"
              className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-text placeholder:text-muted/60 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
            />
          </div>
          <Select
            label="Word part"
            value={partFilter}
            onChange={(e) => setPartFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="">All parts</option>
            {parts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.text} ({p.type})
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-40"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
          <Button onClick={openCreate} className="gap-2" disabled={parts.length === 0}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New word
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Spinner label="Loading words…" className="py-20" />
      ) : words.length === 0 ? (
        <EmptyState
          icon={Pencil}
          title="No words"
          description="Add example words to your word parts so students can see them in context."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="pb-3 pr-4 font-semibold">Word</th>
                <th className="pb-3 pr-4 font-semibold">Definition</th>
                <th className="pb-3 pr-4 font-semibold">Part</th>
                <th className="pb-3 pr-4 font-semibold">Level</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => (
                <tr key={word.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 font-display font-bold">{word.word}</td>
                  <td className="py-3 pr-4 text-muted">{word.definition}</td>
                  <td className="py-3 pr-4">
                    <Badge tone="muted">{word.part_text}</Badge>
                  </td>
                  <td className="py-3 pr-4">
                    <DifficultyBadge difficulty={word.difficulty} />
                  </td>
                  <td className="py-3 pr-4">
                    <Badge tone={statusTone[word.status]}>{word.status}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(word)}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Edit {word.word}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-coral hover:bg-coral/10 hover:text-coral"
                        onClick={() => setDeleteTarget(word)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Delete {word.word}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.word}` : "New example word"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" form="word-form" isLoading={isSaving}>
              {editing ? "Save changes" : "Create word"}
            </Button>
          </>
        }
      >
        <form id="word-form" onSubmit={save} className="flex flex-col gap-4">
          <Select
            label="Word part"
            value={form.wordPartId}
            onChange={(e) => setForm({ ...form, wordPartId: e.target.value })}
            required
          >
            <option value="">Choose a part…</option>
            {parts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.text} ({p.type})
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Word"
              value={form.word}
              onChange={(e) => setForm({ ...form, word: e.target.value })}
              required
            />
            <Input
              label="Pronunciation"
              value={form.pronunciation}
              onChange={(e) => setForm({ ...form, pronunciation: e.target.value })}
              placeholder="e.g. /trænzˈleɪt/"
            />
            <Input
              label="Definition"
              value={form.definition}
              onChange={(e) => setForm({ ...form, definition: e.target.value })}
              required
            />
            <Select
              label="Difficulty"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <Textarea
            label="Example sentence"
            value={form.sentence}
            onChange={(e) => setForm({ ...form, sentence: e.target.value })}
            rows={2}
          />
          {formError && (
            <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              {formError}
            </p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        isBusy={isDeleting}
        title={`Delete ${deleteTarget?.word ?? "word"}?`}
        message="This removes the example word from the library. Students who saved it will keep it in their list, but it will no longer appear on flashcards."
      />
    </div>
  );
}
