"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Company, Job, JobStatus } from "@/lib/types";
import { jobFormSchema, jobFormToPayload, jobToFormInput, type JobFormInput } from "@/lib/validators/job";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase, Pencil, Plus, Search, Trash2, X } from "lucide-react";

const STATUS_BADGE: Record<JobStatus, "default" | "success" | "warning" | "destructive" | "outline"> = {
  draft: "outline",
  published: "success",
  unpublished: "warning",
  closed: "destructive",
  archived: "outline",
};

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "internship", label: "Internship" },
  { value: "internship-ppo", label: "Internship + PPO" },
  { value: "contract", label: "Contract" },
];

const WORK_MODES = [
  { value: "onsite", label: "Onsite" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export function JobsClient({ jobs, companies }: { jobs: Job[]; companies: Company[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<JobStatus | "all">("all");
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
  } = useForm<JobFormInput>({ resolver: zodResolver(jobFormSchema) });

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.companyName.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, debouncedSearch, statusFilter]);

  function openCreateForm() {
    setEditingId(null);
    reset({
      companyId: "",
      title: "",
      description: "",
      location: "",
      workMode: "onsite",
      package: "",
      jobType: "full-time",
      requiredSkills: "",
      preferredSkills: "",
      applicationDeadline: "",
      driveDate: "",
      departments: "",
      minCgpa: "",
      maxBacklogs: "",
      batches: "",
      otherRequirements: "",
    });
    setShowForm(true);
  }

  function openEditForm(job: Job) {
    setEditingId(job.id);
    reset(jobToFormInput(job));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function onSubmit(formData: JobFormInput) {
    setSubmitting(true);
    setError(null);
    try {
      const data = jobFormToPayload(formData);
      const res = await fetch("/api/tpo/jobs", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...data } : data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(typeof json.error === "string" ? json.error : "Failed to save job");
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

  async function updateStatus(jobId: string, status: JobStatus) {
    await fetch(`/api/tpo/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function handleDelete(job: Job) {
    if (!window.confirm(`Delete the "${job.title}" job posting? This cannot be undone.`)) return;
    await fetch(`/api/tpo/jobs?id=${job.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or job title..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobStatus | "all")}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:w-48"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
        <Button onClick={() => (showForm ? closeForm() : openCreateForm())}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Job"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            {companies.length === 0 ? (
              <p className="text-sm text-slate-500">
                Add a company first before creating a job.
              </p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                <p className="sm:col-span-2 text-sm font-semibold text-slate-900">
                  {editingId ? "Edit job" : "New job"}
                </p>
                {error && (
                  <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="companyId">Company</Label>
                  <select
                    id="companyId"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    {...register("companyId")}
                  >
                    <option value="">Select company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.companyId && (
                    <p className="text-xs text-red-600">{errors.companyId.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title">Job title</Label>
                  <Input id="title" placeholder="Software Engineer" {...register("title")} />
                  {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="description">Job description</Label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Hyderabad" {...register("location")} />
                  {errors.location && (
                    <p className="text-xs text-red-600">{errors.location.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="workMode">Work mode</Label>
                  <select
                    id="workMode"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    {...register("workMode")}
                  >
                    {WORK_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="package">Package</Label>
                  <Input id="package" placeholder="₹8-12 LPA" {...register("package")} />
                  {errors.package && (
                    <p className="text-xs text-red-600">{errors.package.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jobType">Job type</Label>
                  <select
                    id="jobType"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                    {...register("jobType")}
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="requiredSkills">Required skills (comma separated)</Label>
                  <Input id="requiredSkills" placeholder="React, Node.js, SQL" {...register("requiredSkills")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="preferredSkills">Preferred skills (comma separated)</Label>
                  <Input id="preferredSkills" placeholder="AWS, Docker" {...register("preferredSkills")} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="applicationDeadline">Application deadline</Label>
                  <Input id="applicationDeadline" type="date" {...register("applicationDeadline")} />
                  {errors.applicationDeadline && (
                    <p className="text-xs text-red-600">{errors.applicationDeadline.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="driveDate">Drive date (optional)</Label>
                  <Input id="driveDate" type="date" {...register("driveDate")} />
                </div>

                <p className="sm:col-span-2 mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Eligibility criteria
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="departments">Eligible departments (comma separated)</Label>
                  <Input id="departments" placeholder="CSE, IT" {...register("departments")} />
                  {errors.departments && (
                    <p className="text-xs text-red-600">{errors.departments.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="batches">Eligible batches (comma separated)</Label>
                  <Input id="batches" placeholder="2022-2026" {...register("batches")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="minCgpa">Minimum CGPA</Label>
                  <Input id="minCgpa" type="number" step="0.1" placeholder="7.0" {...register("minCgpa")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maxBacklogs">Maximum backlogs</Label>
                  <Input id="maxBacklogs" type="number" placeholder="0" {...register("maxBacklogs")} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="otherRequirements">Other requirements (optional)</Label>
                  <Input id="otherRequirements" {...register("otherRequirements")} />
                </div>

                <Button type="submit" disabled={submitting} className="sm:col-span-2 sm:w-fit">
                  {submitting ? "Saving..." : editingId ? "Save changes" : "Save job (as draft)"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={jobs.length === 0 ? "No jobs yet" : "No matching jobs"}
          description={
            jobs.length === 0
              ? "Create your first job posting to start attracting eligible applicants."
              : "Try a different search term or status filter."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <Card key={job.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-600">
                    {job.companyName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <Link href={`/tpo/jobs/${job.id}`} className="truncate text-sm font-semibold text-slate-900 hover:underline">
                      {job.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {job.companyName} · {job.location} · {job.package}
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_BADGE[job.status]} className="capitalize shrink-0">
                  {job.status}
                </Badge>
                <div className="flex shrink-0 gap-2">
                  {job.status !== "published" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, "published")}>
                      Publish
                    </Button>
                  )}
                  {job.status === "published" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, "unpublished")}>
                      Unpublish
                    </Button>
                  )}
                  {job.status !== "closed" && job.status !== "archived" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, "closed")}>
                      Close
                    </Button>
                  )}
                  {job.status !== "archived" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, "archived")}>
                      Archive
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditForm(job)}
                    aria-label="Edit job"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(job)}
                    aria-label="Delete job"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
