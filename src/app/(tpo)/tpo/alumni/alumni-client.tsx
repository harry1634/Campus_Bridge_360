"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Alumni } from "@/lib/types";
import { alumniFormSchema, alumniToFormInput, type AlumniFormInput } from "@/lib/validators/alumni";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { RowActions } from "@/components/shared/row-actions";
import { Plus, Search, Users, X } from "lucide-react";

export function AlumniClient({ alumni }: { alumni: Alumni[] }) {
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
  } = useForm<AlumniFormInput>({ resolver: zodResolver(alumniFormSchema) });

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return alumni;
    return alumni.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.company.toLowerCase().includes(term) ||
        a.designation.toLowerCase().includes(term)
    );
  }, [alumni, debouncedSearch]);

  function openCreateForm() {
    setEditingId(null);
    reset({
      name: "",
      batch: "",
      department: "",
      company: "",
      designation: "",
      industry: "",
      experienceYears: "",
      skills: "",
      email: "",
      phone: "",
      linkedin: "",
      location: "",
      mentorshipAvailable: false,
      careerGuidanceAvailable: false,
    });
    setShowForm(true);
  }

  function openEditForm(a: Alumni) {
    setEditingId(a.id);
    reset(alumniToFormInput(a));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleDelete(a: Alumni) {
    if (!window.confirm(`Delete alumni record for ${a.name}? This cannot be undone.`)) return;
    await fetch(`/api/tpo/alumni?id=${a.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function onSubmit(data: AlumniFormInput) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tpo/alumni", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...data } : data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(typeof json.error === "string" ? json.error : "Failed to save alumni");
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
            placeholder="Search by name, company or designation..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <Button onClick={() => (showForm ? closeForm() : openCreateForm())}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Alumni"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <p className="sm:col-span-2 text-sm font-semibold text-slate-900">
                {editingId ? "Edit alumni" : "New alumni"}
              </p>
              {error && (
                <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batch">Batch</Label>
                <Input id="batch" placeholder="2018-2022" {...register("batch")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="CSE" {...register("department")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register("company")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" {...register("designation")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" {...register("industry")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="experienceYears">Experience (years)</Label>
                <Input id="experienceYears" type="number" {...register("experienceYears")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input id="skills" {...register("skills")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" {...register("linkedin")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} />
              </div>
              <div className="flex items-center gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" {...register("mentorshipAvailable")} />
                  Available for mentorship
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" {...register("careerGuidanceAvailable")} />
                  Available for career guidance
                </label>
              </div>
              <Button type="submit" disabled={submitting} className="sm:col-span-2 sm:w-fit">
                {submitting ? "Saving..." : editingId ? "Save changes" : "Save alumni"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={alumni.length === 0 ? "No alumni added yet" : "No matching alumni"}
          description={
            alumni.length === 0 ? "Add alumni records for students to browse." : "Try a different search term."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Card key={a.id} className="relative">
              <CardContent className="p-5 pr-14">
                <RowActions
                  label="alumni record"
                  onEdit={() => openEditForm(a)}
                  onDelete={() => handleDelete(a)}
                />
                <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                <p className="text-xs text-slate-500">
                  {a.designation} at {a.company}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline">{a.department}</Badge>
                  <Badge variant="outline">Batch {a.batch}</Badge>
                </div>
                {a.mentorshipAvailable && (
                  <Badge variant="success" className="mt-2">
                    Open to mentorship
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
