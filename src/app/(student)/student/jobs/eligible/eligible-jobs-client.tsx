"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase, Calendar, MapPin, Search } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function EligibleJobsClient({
  jobs,
  appliedJobIds,
}: {
  jobs: Job[];
  appliedJobIds: string[];
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [jobTypeFilter, setJobTypeFilter] = React.useState("all");
  const [applying, setApplying] = React.useState<string | null>(null);
  const [applied, setApplied] = React.useState<Set<string>>(new Set(appliedJobIds));
  const [error, setError] = React.useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 200);

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.companyName.toLowerCase().includes(term);
      const matchesType = jobTypeFilter === "all" || job.jobType === jobTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [jobs, debouncedSearch, jobTypeFilter]);

  async function handleApply(jobId: string) {
    setApplying(jobId);
    setError(null);
    try {
      const res = await fetch("/api/student/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to apply");
        return;
      }
      setApplied((prev) => new Set(prev).add(jobId));
      router.refresh();
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
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
          value={jobTypeFilter}
          onChange={(e) => setJobTypeFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:w-52"
        >
          <option value="all">All job types</option>
          <option value="full-time">Full-time</option>
          <option value="internship">Internship</option>
          <option value="internship-ppo">Internship + PPO</option>
          <option value="contract">Contract</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={jobs.length === 0 ? "No eligible jobs right now" : "No matching jobs"}
          description={
            jobs.length === 0
              ? "New job postings that match your academic profile will show up here."
              : "Try a different search term or filter."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => {
            const isApplied = applied.has(job.id);
            return (
              <Card key={job.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-600">
                      {job.companyName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.companyName}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formatDate(job.applicationDeadline)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-emerald-600">{job.package}</p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.requiredSkills.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>

                  <Badge variant="success" className="mt-3">
                    Eligible
                  </Badge>

                  <Button
                    className="mt-4 w-full"
                    disabled={isApplied || applying === job.id}
                    onClick={() => handleApply(job.id)}
                  >
                    {isApplied ? "Applied" : applying === job.id ? "Applying..." : "Apply Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
