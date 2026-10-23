"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Mentor } from "@/lib/types";
import { mentorFormSchema, mentorToFormInput, type MentorFormInput } from "@/lib/validators/mentor";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { RowActions } from "@/components/shared/row-actions";
import { Plus, Search, UsersRound, X } from "lucide-react";

export function MentorsClient({ mentors }: { mentors: Mentor[] }) {
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
  } = useForm<MentorFormInput>({ resolver: zodResolver(mentorFormSchema) });

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return mentors;
    return mentors.filter(
      (m) => m.name.toLowerCase().includes(term) || m.company.toLowerCase().includes(term)
    );
  }, [mentors, debouncedSearch]);

  function openCreateForm() {
    setEditingId(null);
    reset({
      name: "",
      company: "",
      designation: "",
      industry: "",
      experienceYears: "",
      expertise: "",
      skills: "",
      email: "",
      phone: "",
      linkedin: "",
      availability: "",
      guidanceAreas: "",
    });
    setShowForm(true);
  }

  function openEditForm(mentor: Mentor) {
    setEditingId(mentor.id);
    reset(mentorToFormInput(mentor));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleDelete(mentor: Mentor) {
    if (!window.confirm(`Delete mentor ${mentor.name}? This cannot be undone.`)) return;
    await fetch(`/api/tpo/mentors?id=${mentor.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function onSubmit(data: MentorFormInput) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tpo/mentors", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...data } : data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(typeof json.error === "string" ? json.error : "Failed to save mentor");
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
            placeholder="Search by name or company..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <Button onClick={() => (showForm ? closeForm() : openCreateForm())}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Mentor"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <p className="sm:col-span-2 text-sm font-semibold text-slate-900">
                {editingId ? "Edit mentor" : "New mentor"}
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
                <Label htmlFor="expertise">Expertise (comma separated)</Label>
                <Input id="expertise" placeholder="System Design, Career Growth" {...register("expertise")} />
                {errors.expertise && <p className="text-xs text-red-600">{errors.expertise.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input id="skills" {...register("skills")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guidanceAreas">Guidance areas (comma separated)</Label>
                <Input id="guidanceAreas" placeholder="Interview prep, Resume review" {...register("guidanceAreas")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" {...register("linkedin")} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="availability">Availability</Label>
                <Input id="availability" placeholder="Weekends, 30 min slots" {...register("availability")} />
              </div>
              <Button type="submit" disabled={submitting} className="sm:col-span-2 sm:w-fit">
                {submitting ? "Saving..." : editingId ? "Save changes" : "Save mentor"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={mentors.length === 0 ? "No mentors added yet" : "No matching mentors"}
          description={
            mentors.length === 0 ? "Add mentor records for students to browse." : "Try a different search term."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} className="relative">
              <CardContent className="p-5 pr-14">
                <RowActions
                  label="mentor"
                  onEdit={() => openEditForm(m)}
                  onDelete={() => handleDelete(m)}
                />
                <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                <p className="text-xs text-slate-500">
                  {m.designation} at {m.company}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.expertise.slice(0, 3).map((e) => (
                    <Badge key={e} variant="purple">
                      {e}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
