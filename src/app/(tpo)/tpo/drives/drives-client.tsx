"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Company, PlacementDrive } from "@/lib/types";
import {
  driveFormSchema,
  driveFormToPayload,
  driveToFormInput,
  type DriveFormInput,
} from "@/lib/validators/drive";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { RowActions } from "@/components/shared/row-actions";
import { Building2, Plus, Search, X } from "lucide-react";

export function DrivesClient({ drives, companies }: { drives: PlacementDrive[]; companies: Company[] }) {
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
  } = useForm<DriveFormInput>({ resolver: zodResolver(driveFormSchema) });

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return drives;
    return drives.filter(
      (d) => d.companyName.toLowerCase().includes(term) || d.jobRole.toLowerCase().includes(term)
    );
  }, [drives, debouncedSearch]);

  function openCreateForm() {
    setEditingId(null);
    reset({
      companyId: "",
      jobRole: "",
      package: "",
      driveDate: "",
      location: "",
      workMode: "onsite",
      applicationDeadline: "",
      description: "",
      recruitmentStages: "",
      departments: "",
      batches: "",
      minCgpa: "",
      maxBacklogs: "",
    });
    setShowForm(true);
  }

  function openEditForm(drive: PlacementDrive) {
    setEditingId(drive.id);
    reset(driveToFormInput(drive));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleDelete(drive: PlacementDrive) {
    if (!window.confirm(`Delete the ${drive.jobRole} drive at ${drive.companyName}? This cannot be undone.`)) {
      return;
    }
    await fetch(`/api/tpo/drives?id=${drive.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function onSubmit(formData: DriveFormInput) {
    setSubmitting(true);
    setError(null);
    try {
      const data = driveFormToPayload(formData);
      const res = await fetch("/api/tpo/drives", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...data } : data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(typeof json.error === "string" ? json.error : "Failed to save drive");
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
            placeholder="Search by company or job role..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <Button onClick={() => (showForm ? closeForm() : openCreateForm())}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Drive"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            {companies.length === 0 ? (
              <p className="text-sm text-slate-500">Add a company first before creating a drive.</p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                <p className="sm:col-span-2 text-sm font-semibold text-slate-900">
                  {editingId ? "Edit drive" : "New drive"}
                </p>
                {error && (
                  <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="companyId">Company</Label>
                  <select id="companyId" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("companyId")}>
                    <option value="">Select company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.companyId && <p className="text-xs text-red-600">{errors.companyId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jobRole">Job role</Label>
                  <Input id="jobRole" {...register("jobRole")} />
                  {errors.jobRole && <p className="text-xs text-red-600">{errors.jobRole.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="package">Package</Label>
                  <Input id="package" placeholder="₹6-10 LPA" {...register("package")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="workMode">Mode</Label>
                  <select id="workMode" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" {...register("workMode")}>
                    <option value="onsite">Onsite</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...register("location")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="driveDate">Drive date</Label>
                  <Input id="driveDate" type="date" {...register("driveDate")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="applicationDeadline">Application deadline</Label>
                  <Input id="applicationDeadline" type="date" {...register("applicationDeadline")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="recruitmentStages">Recruitment stages (comma separated)</Label>
                  <Input id="recruitmentStages" placeholder="Assessment, Technical Interview, HR Interview" {...register("recruitmentStages")} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea id="description" rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register("description")} />
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
                  {submitting ? "Saving..." : editingId ? "Save changes" : "Save drive"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={drives.length === 0 ? "No placement drives yet" : "No matching drives"}
          description={
            drives.length === 0
              ? "Create your first placement drive to start scheduling company visits."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((drive) => (
            <Card key={drive.id} className="relative">
              <CardContent className="p-5 pr-14">
                <RowActions
                  label="drive"
                  onEdit={() => openEditForm(drive)}
                  onDelete={() => handleDelete(drive)}
                />
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-600">
                    {drive.companyName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{drive.jobRole}</p>
                    <p className="text-xs text-slate-500">{drive.companyName}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <Badge variant="outline">{new Date(drive.driveDate).toLocaleDateString("en-IN")}</Badge>
                  <Badge variant="outline">{drive.location}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-emerald-600">{drive.package}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
