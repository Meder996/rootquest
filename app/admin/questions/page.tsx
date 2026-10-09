"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/admin/modal";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface AdminQuestion {
  id: string;
  type: string;
  prompt: string;
  passage: string | null;
  related_part_id: string | null;
  difficulty: string;
  category: string | null;
  explanation: string;
  status: string;
  author: string | null;
  option_count: number;
  correct_count: number;
}

interface QuestionOptionRow {
  id: string;
  text: string;
  is_correct: number;
}

interface OptionForm {
  text: string;
  isCorrect: boolean;
}

interface QuestionForm {
  type: string;
  prompt: string;
  passage: string;
  relatedPartId: string;
  difficulty: string;
  category: string;
  explanation: string;
  author: string;
  status: string;
  options: OptionForm[];
}

const emptyForm: QuestionForm = {
  type: "meaning",
  prompt: "",
  passage: "",
  relatedPartId: "",
  difficulty: "beginner",
  category: "",
  explanation: "",
  author: "",
  status: "draft",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
};

const statusTone: Record<string, "success" | "yellow" | "muted"> = {
  published: "success",
  draft: "yellow",
  archived: "muted",
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminQuestion | null>(null);
  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: "500" });
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/questions?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setQuestions(data.questions);
    }
    setIsLoading(false);
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    const handle = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(handle);
  }, [load, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  async function openEdit(question: AdminQuestion) {
    setEditing(question);
    setFormError("");
    setModalOpen(true);
    const res = await fetch(`/api/admin/questions/${question.id}`);
    if (res.ok) {
      const data = await res.json();
      const q = data.question;
      const options: QuestionOptionRow[] = q.options;
      setForm({
        type: q.type,
        prompt: q.prompt,
        passage: q.passage ?? "",
        relatedPartId: q.related_part_id ?? "",
        difficulty: q.difficulty,
        category: q.category ?? "",
        explanation: q.explanation,
        author: q.author ?? "",
        status: q.status,
        options: [0, 1, 2, 3].map((i) => ({
          text: options[i]?.text ?? "",
          isCorrect: options[i]?.is_correct === 1,
        })),
      });
    }
  }

  function setOption(index: number, patch: Partial<OptionForm>) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => {
        if (i !== index) {
          // Only one correct answer allowed.
          return patch.isCorrect ? { ...o, isCorrect: false } : o;
        }
        return { ...o, ...patch };
      }),
    }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        passage: form.passage || null,
        relatedPartId: form.relatedPartId || null,
        category: form.category || null,
        author: form.author || null,
      };
      const res = await fetch(
        editing ? `/api/admin/questions/${editing.id}` : "/api/admin/questions",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save the question.");
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the question.");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/admin/questions/${deleteTarget.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (res.ok) {
      setDeleteTarget(null);
      load();
    }
  }

  async function toggleStatus(question: AdminQuestion) {
    const next = question.status === "published" ? "draft" : "published";
    await fetch(`/api/admin/questions/${question.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    load();
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
              placeholder="Search prompts…"
              aria-label="Search questions"
              className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-text placeholder:text-muted/60 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
            />
          </div>
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="sm:w-44"
          >
            <option value="">All types</option>
            <option value="meaning">Meaning</option>
            <option value="infer">Infer</option>
            <option value="example">Example</option>
            <option value="context">Context</option>
            <option value="compare">Compare</option>
            <option value="match">Match</option>
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
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New question
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Spinner label="Loading questions…" className="py-20" />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={Pencil}
          title="No questions"
          description="Create SAT-style multiple-choice questions with explanations."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="pb-3 pr-4 font-semibold">Prompt</th>
                <th className="pb-3 pr-4 font-semibold">Type</th>
                <th className="pb-3 pr-4 font-semibold">Level</th>
                <th className="pb-3 pr-4 font-semibold">Options</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id} className="border-b border-border/50 last:border-0">
                  <td className="max-w-md py-3 pr-4">
                    <span className="line-clamp-2">{question.prompt}</span>
                  </td>
                  <td className="py-3 pr-4 capitalize text-muted">{question.type}</td>
                  <td className="py-3 pr-4">
                    <DifficultyBadge difficulty={question.difficulty} />
                  </td>
                  <td className="py-3 pr-4">
                    {question.option_count === 4 && question.correct_count === 1 ? (
                      <Badge tone="success">4 · 1 correct</Badge>
                    ) : (
                      <Badge tone="coral">
                        {question.option_count} · {question.correct_count} correct
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => toggleStatus(question)}
                      title="Click to toggle publish status"
                    >
                      <Badge tone={statusTone[question.status]}>{question.status}</Badge>
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(question)}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Edit question</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-coral hover:bg-coral/10 hover:text-coral"
                        onClick={() => setDeleteTarget(question)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Archive question</span>
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
        title={editing ? "Edit question" : "New question"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" form="question-form" isLoading={isSaving}>
              {editing ? "Save changes" : "Create question"}
            </Button>
          </>
        }
      >
        <form id="question-form" onSubmit={save} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="meaning">Meaning — what does the part mean?</option>
              <option value="infer">Infer — guess a word's meaning</option>
              <option value="example">Example — pick the word that fits</option>
              <option value="context">Context — meaning in a sentence</option>
              <option value="compare">Compare — which part matches?</option>
              <option value="match">Match — pair parts with meanings</option>
            </Select>
            <Select
              label="Difficulty"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Input
              label="Related part ID (optional)"
              value={form.relatedPartId}
              onChange={(e) => setForm({ ...form, relatedPartId: e.target.value })}
              placeholder="Link to a word part"
            />
            <Input
              label="Author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
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
            label="Prompt"
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            rows={2}
            required
          />
          <Textarea
            label="Passage (optional)"
            value={form.passage}
            onChange={(e) => setForm({ ...form, passage: e.target.value })}
            rows={3}
            placeholder="A short SAT-style reading passage, if the question uses one"
          />

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-text">
              Answer options — mark exactly one correct
            </legend>
            {form.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOption(index, { isCorrect: !option.isCorrect })}
                  aria-pressed={option.isCorrect}
                  aria-label={`Mark option ${index + 1} as correct`}
                  title={option.isCorrect ? "Correct answer" : "Mark as correct"}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    option.isCorrect
                      ? "border-success/60 bg-success/10 text-success"
                      : "border-border bg-surface text-muted hover:border-success/40"
                  }`}
                >
                  {option.isCorrect ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => setOption(index, { text: e.target.value })}
                  placeholder={`Option ${index + 1}`}
                  aria-label={`Option ${index + 1} text`}
                  required
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-text placeholder:text-muted/60 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
                />
              </div>
            ))}
          </fieldset>

          <Textarea
            label="Explanation (shown after answering)"
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
            rows={2}
            required
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
        title="Archive this question?"
        confirmLabel="Archive"
        message="The question is archived rather than deleted, so historical quiz results stay intact. It will no longer appear in quizzes or the library."
      />
    </div>
  );
}
