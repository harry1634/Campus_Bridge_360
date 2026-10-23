"use client";

import * as React from "react";
import type { Application, ApplicationStatus } from "@/lib/types";
import type { DepartmentStats } from "@/lib/business/department-breakdown";
import {
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
} from "@/lib/business/application-status";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ChevronRight, Search, Users } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const SUMMARY_ORDER: { key: keyof DepartmentStats; label: string }[] = [
  { key: "eligible", label: "Eligible" },
  { key: "applied", label: "Applied" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "selected", label: "Selected" },
];

export function JobDetailClient({
  departmentStats,
  applications,
}: {
  departmentStats: DepartmentStats[];
  applications: Application[];
}) {
  const [activeDepartment, setActiveDepartment] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 200);

  const totals: Record<string, number> = {};
  for (const { key } of SUMMARY_ORDER) {
    totals[key] = departmentStats.reduce((sum, d) => sum + Number(d[key]), 0);
  }

  const departmentApplications = React.useMemo(() => {
    if (!activeDepartment) return [];
    const term = debouncedSearch.trim().toLowerCase();
    return applications
      .filter((a) => a.department === activeDepartment)
      .filter((a) => !term || a.studentName.toLowerCase().includes(term) || a.studentId.toLowerCase().includes(term));
  }, [applications, activeDepartment, debouncedSearch]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_ORDER.map(({ key, label }) => (
          <Card key={key}>
            <CardContent className="p-5">
              <p className="text-2xl font-bold text-slate-900">{totals[key]}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department breakdown table */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-900">Applications by Department</h2>
            <p className="text-xs text-slate-500">Click a department to view individual applicants.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Eligible</th>
                  <th className="px-5 py-3 font-medium">Applied</th>
                  <th className="px-5 py-3 font-medium">Shortlisted</th>
                  <th className="px-5 py-3 font-medium">Selected</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((d) => (
                  <tr
                    key={d.department}
                    onClick={() => setActiveDepartment(activeDepartment === d.department ? null : d.department)}
                    className={`cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/50 ${
                      activeDepartment === d.department ? "bg-teal-50/50" : ""
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">{d.department}</td>
                    <td className="px-5 py-3 text-slate-600">{d.eligible}</td>
                    <td className="px-5 py-3 text-slate-600">{d.applied}</td>
                    <td className="px-5 py-3 text-slate-600">{d.shortlisted}</td>
                    <td className="px-5 py-3 text-emerald-600">{d.selected}</td>
                    <td className="px-5 py-3 text-right">
                      <ChevronRight
                        className={`ml-auto h-4 w-4 text-slate-400 transition-transform ${
                          activeDepartment === d.department ? "rotate-90" : ""
                        }`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Drill-down student list */}
      {activeDepartment && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">
                {activeDepartment} → {departmentApplications.length} students
              </h2>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="w-40 bg-transparent text-xs focus:outline-none"
                />
              </div>
            </div>

            {departmentApplications.length === 0 ? (
              <EmptyState icon={Users} title="No students" description="No applicants in this department yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                      <th className="py-2 font-medium">Student ID</th>
                      <th className="py-2 font-medium">Name</th>
                      <th className="py-2 font-medium">CGPA</th>
                      <th className="py-2 font-medium">Status</th>
                      <th className="py-2 font-medium">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentApplications.map((app) => (
                      <tr key={app.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-2.5 font-medium text-slate-700">{app.studentId}</td>
                        <td className="py-2.5 text-slate-900">{app.studentName}</td>
                        <td className="py-2.5 text-slate-600">{app.cgpa}</td>
                        <td className="py-2.5">
                          <Badge variant={APPLICATION_STATUS_BADGE[app.status as ApplicationStatus]}>
                            {APPLICATION_STATUS_LABELS[app.status as ApplicationStatus]}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-slate-500">{formatDate(app.appliedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
