"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Application, ApplicationStatus } from "@/lib/types";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
} from "@/lib/business/application-status";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ClipboardList, Search } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function ApplicationsClient({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState<ApplicationStatus | "all">("all");
  const [updating, setUpdating] = React.useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 200);

  const departments = React.useMemo(
    () => Array.from(new Set(applications.map((a) => a.department))).sort(),
    [applications]
  );

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesSearch =
        !term ||
        app.studentName.toLowerCase().includes(term) ||
        app.companyName.toLowerCase().includes(term) ||
        app.studentId.toLowerCase().includes(term);
      const matchesDept = departmentFilter === "all" || app.department === departmentFilter;
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [applications, debouncedSearch, departmentFilter, statusFilter]);

  async function updateStatus(id: string, status: ApplicationStatus) {
    setUpdating(id);
    try {
      await fetch(`/api/tpo/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setUpdating(null);
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
            placeholder="Search by student or company..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:w-44"
        >
          <option value="all">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:w-52"
        >
          <option value="all">All statuses</option>
          {APPLICATION_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={applications.length === 0 ? "No applications yet" : "No matching applications"}
          description={
            applications.length === 0
              ? "Applications will appear here once students start applying to published jobs."
              : "Try a different search term or filter."
          }
        />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Applied On</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{app.studentName}</p>
                      <p className="text-xs text-slate-400">{app.studentId}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="default">{app.department}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{app.companyName}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(app.appliedAt)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={app.status}
                        disabled={updating === app.id}
                        onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                      >
                        {APPLICATION_STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>
                            {APPLICATION_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      <Badge variant={APPLICATION_STATUS_BADGE[app.status]} className="ml-2">
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
