"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BookOpen, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge, DifficultyBadge, PartTypeBadge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/admin/modal";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

interface AdminLesson {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: string;
  status: string;
  order_index: number;
  part_count: number;
}

interface LessonPart {
  id: string;
  text: string;
  type: string;
  meaning: string;
  difficulty: string;
  position: number;
}

interface PartOption {
  id: string;
  text: string;
  type: string;
  status: string;
}

interface LessonForm {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status: string;
  orderIndex: string;
}

const emptyForm: LessonForm = {
  title: "",
  description: "",
  category: "",
  difficulty: "beginner",
  status: "draft",
  orderIndex: "0",
};

const statusTone: Record<string, "success" | "yellow" | "muted"> = {
  published: "success",
  draft: "yellow",
  archived: "muted",
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminLesson | null>(null);
  const [form, setForm] = useState<LessonForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Parts manager state.
  const [partsModalLesson, setPartsModalLesson] = useState<AdminLesson | null>(null);
  const [lessonParts, setLessonParts] = useState<LessonPart[]>([]);
  const [allParts, setAllParts] = useState<PartOption[]>([]);
  const [partSearch, setPartSearch] = useState("");
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [isSavingParts, setIsSavingParts] = useState(false);
  const [partsError, setPartsError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AdminLesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/admin/lessons");
    if (res.ok) {
      const data = await res.json();
      setLessons(data.lessons);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch("/api/admin/word-parts?limit=500&status=published")
      .then((res) => res.json())
      .then((data) => setAllParts(data.parts));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(lesson: AdminLesson) {
    setEditing(lesson);
    setForm({
      title: lesson.title,
      description: lesson.description ?? "",
      category: lesson.category ?? "",
      difficulty: lesson.difficulty,
      status: lesson.status,
      orderIndex: String(lesson.order_index),
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
        title: form.title,
        description: form.description || null,
        category: form.category || null,
        difficulty: form.difficulty,
        status: form.status,
        orderIndex: Number(form.orderIndex) || 0,
      };
      const res = await fetch(
        editing ? `/api/admin/lessons/${editing.id}` : "/api/admin/lessons",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save the lesson.");
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the lesson.");
    } finally {
      setIsSaving(false);
    }
  }

  async function openPartsManager(lesson: AdminLesson) {
    setPartsModalLesson(lesson);
    setPartsError("");
    setPartSearch("");
    setIsLoadingParts(true);
    const res = await fetch(`/api/admin/lessons/${lesson.id}`);
    if (res.ok) {
      const data = await res.json();
      setLessonParts(data.parts);
    }
    setIsLoadingParts(false);
  }

  function addPart(part: PartOption) {
    if (lessonParts.some((p) => p.id === part.id)) return;
    setLessonParts((prev) => [
      ...prev,
      {
        id: part.id,
        text: part.text,
        type: part.type,
        meaning: "",
        difficulty: "beginner",
        position: prev.length,
      },
    ]);
  }

  function removePart(partId: string) {
    setLessonParts((prev) => prev.filter((p) => p.id !== partId));
  }

  function movePart(partId: string, direction: -1 | 1) {
    setLessonParts((prev) => {
      const index = prev.findIndex((p) => p.id === partId);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function saveParts() {
    if (!partsModalLesson) return;
    setPartsError("");
    setIsSavingParts(true);
    try {
      const res = await fetch(`/api/admin/lessons/${partsModalLesson.id}/parts`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ partIds: lessonParts.map((p) => p.id) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save the lesson parts.");
      setPartsModalLesson(null);
      load();
    } catch (err) {
      setPartsError(err instanceof Error ? err.message : "Could not save the lesson parts.");
    } finally {
      setIsSavingParts(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/admin/lessons/${deleteTarget.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (res.ok) {
      setDeleteTarget(null);
      load();
    }
  }

  const availableParts = allParts.filter(
    (p) =>
      !lessonParts.some((lp) => lp.id === p.id) &&
      (partSearch === "" ||
        p.text.toLowerCase().includes(partSearch.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{lessons.length} lessons</p>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New lesson
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Spinner label="Loading lessons…" className="py-20" />
      ) : lessons.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No lessons"
          description="Create a lesson and fill it with word parts."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold">{lesson.title}</h3>
                  <p className="text-xs text-muted">
                    #{lesson.order_index} · {lesson.part_count} parts
                  </p>
                </div>
                <Badge tone={statusTone[lesson.status]}>{lesson.status}</Badge>
              </div>
              {lesson.description && (
                <p className="mb-3 line-clamp-2 text-sm text-muted">{lesson.description}</p>
              )}
              <div className="mb-3 flex items-center gap-2">
                <DifficultyBadge difficulty={lesson.difficulty} />
                {lesson.category && <Badge tone="muted">{lesson.category}</Badge>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => openPartsManager(lesson)}>
                  Manage parts
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(lesson)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-coral hover:bg-coral/10 hover:text-coral"
                  onClick={() => setDeleteTarget(lesson)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Archive
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- lesson editor */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.title}` : "New lesson"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" form="lesson-form" isLoading={isSaving}>
              {editing ? "Save changes" : "Create lesson"}
            </Button>
          </>
        }
      >
        <form id="lesson-form" onSubmit={save} className="flex flex-col gap-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
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
          <Input
            label="Order index"
            type="number"
            min={0}
            value={form.orderIndex}
            onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
            helperText="Lower numbers appear first in the learning path."
          />
          {formError && (
            <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              {formError}
            </p>
          )}
        </form>
      </Modal>

      {/* -------------------------------------------------- parts manager */}
      <Modal
        open={!!partsModalLesson}
        onClose={() => setPartsModalLesson(null)}
        title={`Parts in ${partsModalLesson?.title ?? "lesson"}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPartsModalLesson(null)} disabled={isSavingParts}>
              Close
            </Button>
            <Button onClick={saveParts} isLoading={isSavingParts}>
              Save parts
            </Button>
          </>
        }
      >
        {isLoadingParts ? (
          <Spinner label="Loading parts…" className="py-10" />
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-text">
                In this lesson ({lessonParts.length})
              </h3>
              {lessonParts.length === 0 ? (
                <p className="text-sm text-muted">No parts yet — add some below.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {lessonParts.map((part, index) => (
                    <li
                      key={part.id}
                      className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2"
                    >
                      <span className="w-6 text-center font-mono text-xs text-muted">
                        {index + 1}
                      </span>
                      <PartTypeBadge type={part.type} />
                      <span className="font-display font-bold">{part.text}</span>
                      <span className="ml-auto flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => movePart(part.id, -1)}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => movePart(part.id, 1)}
                          disabled={index === lessonParts.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-coral hover:bg-coral/10 hover:text-coral"
                          onClick={() => removePart(part.id)}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Remove {part.text}</span>
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-text">Add published parts</h3>
              <Input
                label="Filter parts"
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                placeholder="Type to filter…"
              />
              <ul className="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto">
                {availableParts.slice(0, 50).map((part) => (
                  <li key={part.id}>
                    <button
                      type="button"
                      onClick={() => addPart(part)}
                      className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-violet/50"
                    >
                      <Plus className="h-4 w-4 text-turquoise" aria-hidden="true" />
                      <PartTypeBadge type={part.type} />
                      <span className="font-display font-bold">{part.text}</span>
                    </button>
                  </li>
                ))}
                {availableParts.length === 0 && (
                  <li className="py-2 text-sm text-muted">No matching parts.</li>
                )}
              </ul>
            </div>
            {partsError && (
              <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
                {partsError}
              </p>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        isBusy={isDeleting}
        title={`Archive ${deleteTarget?.title ?? "lesson"}?`}
        confirmLabel="Archive"
        message="The lesson is archived rather than deleted. Students keep their progress on its parts."
      />
    </div>
  );
}
