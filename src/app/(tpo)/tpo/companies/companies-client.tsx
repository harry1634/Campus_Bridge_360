"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Company } from "@/lib/types";
import { companySchema, type CompanyInput } from "@/lib/validators/company";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { RowActions } from "@/components/shared/row-actions";
import { Building2, Plus, Search, X } from "lucide-react";

export function CompaniesClient({ companies }: { companies: Company[] }) {
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
  } = useForm<CompanyInput>({ resolver: zodResolver(companySchema) });

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.industry ?? "").toLowerCase().includes(term) ||
        (c.location ?? "").toLowerCase().includes(term)
    );
  }, [companies, debouncedSearch]);

  function openCreateForm() {
    setEditingId(null);
    reset({ name: "", industry: "", website: "", location: "", description: "" });
    setShowForm(true);
  }

  function openEditForm(company: Company) {
    setEditingId(company.id);
    reset({
      name: company.name,
      industry: company.industry ?? "",
      website: company.website ?? "",
      location: company.location ?? "",
      description: company.description ?? "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleDelete(company: Company) {
    if (!window.confirm(`Delete ${company.name}? This cannot be undone.`)) return;
    await fetch(`/api/tpo/companies?id=${company.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function onSubmit(data: CompanyInput) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tpo/companies", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...data } : data),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(typeof json.error === "string" ? json.error : "Failed to save company");
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
            placeholder="Search by name, industry or location..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <Button onClick={() => (showForm ? closeForm() : openCreateForm())}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Company"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <p className="sm:col-span-2 text-sm font-semibold text-slate-900">
                {editingId ? "Edit company" : "New company"}
              </p>
              {error && (
                <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name">Company name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="e.g. IT Services" {...register("industry")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g. Hyderabad" {...register("location")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://..." {...register("website")} />
                {errors.website && (
                  <p className="text-xs text-red-600">{errors.website.message}</p>
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  {...register("description")}
                />
              </div>
              <Button type="submit" disabled={submitting} className="sm:col-span-2 sm:w-fit">
                {submitting ? "Saving..." : editingId ? "Save changes" : "Save company"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={companies.length === 0 ? "No companies yet" : "No matching companies"}
          description={
            companies.length === 0
              ? "Add your first recruiting company to start creating jobs and drives."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((company) => (
            <Card key={company.id} className="relative transition-shadow hover:shadow-md">
              <CardContent className="p-5 pr-14">
                <RowActions
                  label="company"
                  onEdit={() => openEditForm(company)}
                  onDelete={() => handleDelete(company)}
                />
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-600">
                    {company.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{company.name}</p>
                    <p className="text-xs text-slate-500">{company.industry || "—"}</p>
                  </div>
                </div>
                {company.location && (
                  <p className="mt-3 text-xs text-slate-500">📍 {company.location}</p>
                )}
                {company.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">{company.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
