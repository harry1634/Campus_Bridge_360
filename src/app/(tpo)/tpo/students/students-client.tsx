"use client";

import * as React from "react";
import type { StudentProfile } from "@/lib/types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, Users } from "lucide-react";

export function StudentsClient({ students }: { students: StudentProfile[] }) {
  const [search, setSearch] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const [batchFilter, setBatchFilter] = React.useState("all");
  const debouncedSearch = useDebouncedValue(search, 200);

  const departments = React.useMemo(
    () => Array.from(new Set(students.map((s) => s.department))).sort(),
    [students]
  );
  const batches = React.useMemo(
    () => Array.from(new Set(students.map((s) => s.batch))).sort(),
    [students]
  );

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch =
        !term || s.name.toLowerCase().includes(term) || s.studentId.toLowerCase().includes(term);
      const matchesDept = departmentFilter === "all" || s.department === departmentFilter;
      const matchesBatch = batchFilter === "all" || s.batch === batchFilter;
      return matchesSearch && matchesDept && matchesBatch;
    });
  }, [students, debouncedSearch, departmentFilter, batchFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or student ID..."
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
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:w-44"
        >
          <option value="all">All batches</option>
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={students.length === 0 ? "No students yet" : "No matching students"}
          description={
            students.length === 0
              ? "Import student academic data to populate this list."
              : "Try a different search term or filter."
          }
        />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-5 py-3 font-medium">Student ID</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Batch</th>
                  <th className="px-5 py-3 font-medium">CGPA</th>
                  <th className="px-5 py-3 font-medium">Backlogs</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.uid} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium text-slate-700">{student.studentId}</td>
                    <td className="px-5 py-3 text-slate-900">{student.name}</td>
                    <td className="px-5 py-3">
                      <Badge variant="default">{student.department}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{student.batch}</td>
                    <td className="px-5 py-3 text-slate-600">{student.cgpa || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={student.backlogs > 0 ? "warning" : "success"}>
                        {student.backlogs}
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
