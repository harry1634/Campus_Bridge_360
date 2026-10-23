"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Company, PlacementExam } from "@/lib/types";
import { examFormSchema, examFormToPayload, examToFormInput, type ExamFormInput } from "@/lib/validators/exam";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { RowActions } from "@/components/shared/row-actions";
import { GraduationCap, Plus, Search, X } from "lucide-react";

export function ExamsClient({ exams, companies }: { exams: PlacementExam[]; companies: Company[] }) {
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
  } = useForm<ExamFormInput>({ resolver: zodResolver(examFormSchema) });

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return exams;
    return exams.filter(
      (e) => e.name.toLowerCase().includes(term) || (e.companyName ?? "").toLowerCase().includes(term)
    );
  }, [exams, debouncedSearch]);

  function openCreateForm() {
    setEditingId(null);
    reset({
      name: "",
      companyId: "",
      date: "",
      time: "",
      durationMinutes: "",
      examType: "aptitude",
      platform: "",
      examLink: "",
      instructions: "",
      deadline: "",
      departments: "",
      batches: "",
      minCgpa: "",
      maxBacklogs: "",
    });
    setShowForm(true);
  }

  function openEditForm(exam: PlacementExam) {
    setEditingId(exam.id);
    reset(examToFormInput(exam));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleDelete(exam: PlacementExam) {
    if (!window.confirm(`Delete the "${exam.name}" exam? This cannot be undone.`)) return;
    await fetch(`/api/tpo/exams?id=${exam.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function onSubmit(formData: ExamFormInput) {
    setSubmitting(true);
    setError(null);
    try {
      const data = examFormToPayload(formData);
      const res = await fetch("/api/tpo/exams", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...data } : data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(typeof json.error === "string" ? json.error : "Failed to save exam");
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
            placeholder="Search by exam name or company..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <Button onClick={() => (showForm ? closeForm() : openCreateForm())}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Exam"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <p className="sm:col-span-2 text-sm font-semibold text-slate-900">
                {editingId ? "Edit exam" : "New exam"}
              </p>
              {error && (
                <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name">Exam name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="companyId">Company (optional)</Label>
                <select id="companyId" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("companyId")}>
                  <option value="">None</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register("date")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" {...register("time")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                <Input id="durationMinutes" type="number" placeholder="60" {...register("durationMinutes")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="examType">Exam type</Label>
                <select id="examType" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("examType")}>
                  <option value="aptitude">Aptitude</option>
                  <option value="coding">Coding</option>
                  <option value="technical">Technical</option>
                  <option value="communication">Communication</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="platform">Exam platform</Label>
                <Input id="platform" placeholder="HackerRank, AMCAT..." {...register("platform")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="examLink">Exam link</Label>
                <Input id="examLink" placeholder="https://..." {...register("examLink")} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="instructions">Instructions</Label>
                <textarea id="instructions" rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register("instructions")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Registration deadline</Label>
                <Input id="deadline" type="date" {...register("deadline")} />
              </div>

              <p className="sm:col-span-2 mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Eligibility criteria
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="departments">Eligible departments (comma separated)</Label>
                <Input id="departments" placeholder="CSE, IT" {...register("departments")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batches">Eligible batches (comma separated)</Label>
                <Input id="batches" placeholder="2022-2026" {...register("batches")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="minCgpa">Minimum CGPA</Label>
                <Input id="minCgpa" type="number" step="0.1" {...register("minCgpa")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxBacklogs">Maximum backlogs</Label>
                <Input id="maxBacklogs" type="number" {...register("maxBacklogs")} />
              </div>

              <Button type="submit" disabled={submitting} className="sm:col-span-2 sm:w-fit">
                {submitting ? "Saving..." : editingId ? "Save changes" : "Save exam"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={exams.length === 0 ? "No placement exams yet" : "No matching exams"}
          description={
            exams.length === 0
              ? "Create your first placement exam entry."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exam) => (
            <Card key={exam.id} className="relative">
              <CardContent className="p-5 pr-14">
                <RowActions
                  label="exam"
                  onEdit={() => openEditForm(exam)}
                  onDelete={() => handleDelete(exam)}
                />
                <p className="text-sm font-semibold text-slate-900">{exam.name}</p>
                {exam.companyName && <p className="text-xs text-slate-500">{exam.companyName}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">{new Date(exam.date).toLocaleDateString("en-IN")}</Badge>
                  <Badge variant="outline">{exam.time}</Badge>
                  <Badge variant="outline">{exam.durationMinutes} mins</Badge>
                </div>
                <Badge variant="purple" className="mt-2 capitalize">
                  {exam.examType}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
