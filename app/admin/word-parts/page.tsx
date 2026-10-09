"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge, DifficultyBadge, PartTypeBadge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/admin/modal";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { WordPart } from "@/types";

interface PartForm {
  text: string;
  type: string;
  meaning: string;
  description: string;
  origin: string;
  difficulty: string;
  category: string;
  visualMnemonic: string;
  status: string;
}

const emptyForm: PartForm = {
  text: "",
  type: "root",
  meaning: "",
  description: "",
  origin: "",
  difficulty: "beginner",
  category: "",
  visualMnemonic: "",
  status: "draft",
};

const statusTone: Record<string, "success" | "yellow" | "muted"> = {
  published: "success",
  draft: "yellow",
  archived: "muted",
};

export default function AdminWordPartsPage() {
  const [parts, setParts] = useState<WordPart[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WordPart | null>(null);
  const [form, setForm] = useState<PartForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<WordPart | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: "500" });
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/word-parts?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setParts(data.parts);
      setTotal(data.total);
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

  function openEdit(part: WordPart) {
    setEditing(part);
    setForm({
      text: part.text,
      type: part.type,
      meaning: part.meaning,
      description: part.description ?? "",
      origin: part.origin ?? "",
      difficulty: part.difficulty,
      category: part.category ?? "",
      visualMnemonic: part.visual_mnemonic ?? "",
      status: part.status,
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
        description: form.description || null,
        origin: form.origin || null,
        category: form.category || null,
        visualMnemonic: form.visualMnemonic || null,
      };
      const res = await fetch(
        editing ? `/api/admin/word-parts/${editing.id}` : "/api/admin/word-parts",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save the word part.");
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the word part.");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/admin/word-parts/${deleteTarget.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (res.ok) {
      setDeleteTarget(null);
      load();
    }
  }

  async function toggleStatus(part: WordPart) {
    const next = part.status === "published" ? "draft" : "published";
    await fetch(`/api/admin/word-parts/${part.id}`, {
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
              placeholder="Search text or meaning…"
              aria-label="Search word parts"
              className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-text placeholder:text-muted/60 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
            />
          </div>
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="sm:w-40"
          >
            <option value="">All types</option>
            <option value="prefix">Prefix</option>
            <option value="root">Root</option>
            <option value="suffix">Suffix</option>
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
            New part
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">{total} word parts</p>
      </Card>

      {isLoading ? (
        <Spinner label="Loading word parts…" className="py-20" />
      ) : parts.length === 0 ? (
        <EmptyState
          icon={Pencil}
          title="No word parts"
          description="Create your first word part to get started."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="pb-3 pr-4 font-semibold">Part</th>
                <th className="pb-3 pr-4 font-semibold">Meaning</th>
                <th className="pb-3 pr-4 font-semibold">Type</th>
                <th className="pb-3 pr-4 font-semibold">Level</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4">
                    <span className="font-display font-bold">{part.text}</span>
                  </td>
                  <td className="py-3 pr-4 text-muted">{part.meaning}</td>
                  <td className="py-3 pr-4">
                    <PartTypeBadge type={part.type} />
                  </td>
                  <td className="py-3 pr-4">
                    <DifficultyBadge difficulty={part.difficulty} />
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => toggleStatus(part)}
                      title="Click to toggle publish status"
                    >
                      <Badge tone={statusTone[part.status]}>{part.status}</Badge>
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(part)}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Edit {part.text}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-coral hover:bg-coral/10 hover:text-coral"
                        onClick={() => setDeleteTarget(part)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Delete {part.text}</span>
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
        title={editing ? `Edit ${editing.text}` : "New word part"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" form="word-part-form" isLoading={isSaving}>
              {editing ? "Save changes" : "Create part"}
            </Button>
          </>
        }
      >
        <form id="word-part-form" onSubmit={save} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Text"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="e.g. trans-"
              required
            />
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="prefix">Prefix</option>
              <option value="root">Root</option>
              <option value="suffix">Suffix</option>
            </Select>
            <Input
              label="Meaning"
              value={form.meaning}
              onChange={(e) => setForm({ ...form, meaning: e.target.value })}
              required
            />
            <Input
              label="Origin"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              placeholder="e.g. Latin"
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
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. movement"
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
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <Input
            label="Visual mnemonic"
            value={form.visualMnemonic}
            onChange={(e) => setForm({ ...form, visualMnemonic: e.target.value })}
            placeholder="A short memory hook shown on flashcards"
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
        title={`Delete ${deleteTarget?.text ?? "word part"}?`}
        message="This removes the word part and its example words and questions from the library. Existing student progress rows are kept for analytics. This cannot be undone."
      />
    </div>
  );
}
