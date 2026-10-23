"use client";

import * as React from "react";
import Link from "next/link";
import type { Application, ApplicationStatus } from "@/lib/types";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
} from "@/lib/business/application-status";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase, ChevronDown, ChevronUp, Search } from "lucide-react";

const STATUS_FILTERS: { label: string; value: ApplicationStatus | "all" }[] = [
  { label: "All statuses", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Assessment", value: "assessment" },
  { label: "Technical Interview", value: "technical_interview" },
  { label: "HR Interview", value: "hr_interview" },
  { label: "Selected", value: "selected" },
  { label: "Rejected", value: "rejected" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ApplicationsList({ applications }: { applications: Application[] }) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ApplicationStatus | "all">("all");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 200);

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesSearch =
        !term ||
        app.companyName.toLowerCase().includes(term) ||
        app.studentName.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, debouncedSearch, statusFilter]);

  const activeCount = applications.filter(
    (a) => a.status !== "selected" && a.status !== "rejected"
  ).length;
  const selectedCount = applications.filter((a) => a.status === "selected").length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
            <p className="text-xs text-slate-500">Total applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold text-teal-600">{activeCount}</p>
            <p className="text-xs text-slate-500">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold text-emerald-600">{selectedCount}</p>
            <p className="text-xs text-slate-500">Selected</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:w-56"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Once you apply to eligible jobs, they'll show up here with live status tracking."
          action={
            <Link href="/student/jobs/eligible">
              <Button size="sm">Browse eligible jobs</Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching applications"
          description="Try a different search term or clear the status filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const expanded = expandedId === app.id;
            return (
              <Card key={app.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : app.id)}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-600">
                    {app.companyName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {app.companyName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Applied on {formatDate(app.appliedAt)}
                    </p>
                  </div>
                  <Badge variant={APPLICATION_STATUS_BADGE[app.status]}>
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </Badge>
                  {expanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                </button>

                {expanded && (
                  <CardContent className="border-t border-slate-100 pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Status timeline
                    </p>
                    <div className="space-y-3">
                      {[...app.statusHistory].reverse().map((event, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              i === 0 ? "bg-teal-600" : "bg-slate-300"
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {APPLICATION_STATUS_LABELS[event.status]}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(event.changedAt)}
                              {event.notes ? ` · ${event.notes}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
