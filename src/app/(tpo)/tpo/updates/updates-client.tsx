"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PlacementUpdate } from "@/lib/types";
import {
  updateFormSchema,
  updateFormToPayload,
  updateToFormInput,
  type UpdateFormInput,
} from "@/lib/validators/update";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { RowActions } from "@/components/shared/row-actions";
import { Megaphone, Plus, Search, X } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  new_drive: "New Drive",
  interview_schedule: "Interview Schedule",
  assessment: "Assessment",
  company_update: "Company Update",
  deadline_reminder: "Deadline Reminder",
  selection_announcement: "Selection Announcement",
  notice: "Notice",
};

export function UpdatesClient({ updates }: { updates: PlacementUpdate[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 200);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFormInput>({ resolver: zodResolver(updateFormSchema) });

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return updates;
    return updates.filter((u) => u.title.toLowerCase().includes(term) || u.body.toLowerCase().includes(term));
  }, [updates, debouncedSearch]);

  function openCreateForm() {
    setEditingId(null);
    reset({ title: "", body: "", category: "notice", audienceDepartments: "" });
    setShowForm(true);
  }

  function openEditForm(update: PlacementUpdate) {
    setEditingId(update.id);
    reset(updateToFormInput(update));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleDelete(update: PlacementUpdate) {
    if (!window.confirm(`Delete the update "${update.title}"? This cannot be undone.`)) return;
    await fetch(`/api/tpo/updates?id=${update.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function onSubmit(formData: UpdateFormInput) {
    setSubmitting(true);
    setError(null);
    try {
      const data = updateFormToPayload(formData);
      const res = await fetch("/api/tpo/updates", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...data } : data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(typeof json.error === "string" ? json.error : "Failed to save update");
        return;
      }
      reset();
      setShowForm(false);
      setEditingId(null);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search updates..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <Button onClick={() => (showForm ? closeForm() : openCreateForm())}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New Update"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <p className="sm:col-span-2 text-sm font-semibold text-slate-900">
                {editingId ? "Edit update" : "New update"}
              </p>
              {error && (
                <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
              )}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <select id="category" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("category")}>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="audienceDepartments">Departments (blank = all)</Label>
                <Input id="audienceDepartments" placeholder="CSE, IT" {...register("audienceDepartments")} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="body">Message</Label>
                <textarea id="body" rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register("body")} />
                {errors.body && <p className="text-xs text-red-600">{errors.body.message}</p>}
              </div>
              <Button type="submit" disabled={submitting} className="sm:col-span-2 sm:w-fit">
                {submitting
                  ? editingId
                    ? "Saving..."
                    : "Publishing..."
                  : editingId
                    ? "Save changes"
                    : "Publish update"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={updates.length === 0 ? "No updates published yet" : "No matching updates"}
          description={
            updates.length === 0
              ? "Publish your first placement update to notify students."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((update) => (
            <Card key={update.id} className="relative">
              <CardContent className="p-5">
                <RowActions
                  label="update"
                  onEdit={() => openEditForm(update)}
                  onDelete={() => handleDelete(update)}
                />
                <div className="flex items-center justify-between gap-3 pr-16">
                  <p className="text-sm font-semibold text-slate-900">{update.title}</p>
                  <Badge variant="default">{CATEGORY_LABELS[update.category]}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{update.body}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(update.createdAt).toLocaleString("en-IN")} ·{" "}
                  {update.audience === "all" ? "All students" : update.audience.join(", ")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
