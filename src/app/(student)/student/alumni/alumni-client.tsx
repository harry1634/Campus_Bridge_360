"use client";

import * as React from "react";
import type { Alumni } from "@/lib/types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ExternalLink, Search, Users } from "lucide-react";

export function StudentAlumniClient({ alumni }: { alumni: Alumni[] }) {
  const [search, setSearch] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const debouncedSearch = useDebouncedValue(search, 200);

  const departments = React.useMemo(
    () => Array.from(new Set(alumni.map((a) => a.department))).sort(),
    [alumni]
  );

  const filtered = React.useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return alumni.filter((a) => {
      const matchesSearch =
        !term ||
        a.name.toLowerCase().includes(term) ||
        a.company.toLowerCase().includes(term) ||
        a.designation.toLowerCase().includes(term);
      const matchesDept = departmentFilter === "all" || a.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [alumni, debouncedSearch, departmentFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company or designation..."
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
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={alumni.length === 0 ? "No alumni records yet" : "No matching alumni"}
          description={
            alumni.length === 0 ? "Your TPO hasn't added alumni records yet." : "Try a different search term."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Card key={a.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-sm font-bold text-purple-600">
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-500">
                      {a.designation} at {a.company}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="outline">{a.department}</Badge>
                  <Badge variant="outline">Batch {a.batch}</Badge>
                </div>
                {a.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.skills.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2">
                  {a.mentorshipAvailable && <Badge variant="success">Open to mentorship</Badge>}
                  {a.linkedin && (
                    <a href={a.linkedin} target="_blank" rel="noopener noreferrer" className="text-teal-600">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
