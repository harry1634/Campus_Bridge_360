"use client";

import * as React from "react";
import type { Job, StudentProfile } from "@/lib/types";
import { computeSkillGaps } from "@/lib/business/skill-gap";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Target } from "lucide-react";

export function SkillGapsClient({ students, jobs }: { students: StudentProfile[]; jobs: Job[] }) {
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const [companyFilter, setCompanyFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");

  const departments = React.useMemo(
    () => Array.from(new Set(students.map((s) => s.department))).sort(),
    [students]
  );
  const companies = React.useMemo(
    () => Array.from(new Set(jobs.map((j) => j.companyName))).sort(),
    [jobs]
  );
  const roles = React.useMemo(() => Array.from(new Set(jobs.map((j) => j.title))).sort(), [jobs]);

  const filteredStudents = React.useMemo(
    () => students.filter((s) => departmentFilter === "all" || s.department === departmentFilter),
    [students, departmentFilter]
  );
  const filteredJobs = React.useMemo(
    () =>
      jobs.filter(
        (j) =>
          (companyFilter === "all" || j.companyName === companyFilter) &&
          (roleFilter === "all" || j.title === roleFilter)
      ),
    [jobs, companyFilter, roleFilter]
  );

  const gaps = React.useMemo(
    () => computeSkillGaps(filteredStudents, filteredJobs),
    [filteredStudents, filteredJobs]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
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
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:w-48"
        >
          <option value="all">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:w-48"
        >
          <option value="all">All job roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {gaps.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No skill gap data"
          description="Add job postings with required skills and student profiles with skills to see gap analysis."
        />
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="mb-4 text-sm font-semibold text-slate-900">
              Top Skill Gaps ({filteredStudents.length} students analyzed)
            </p>
            <div className="space-y-4">
              {gaps.slice(0, 10).map((gap) => (
                <div key={gap.skill}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{gap.skill}</span>
                    <span className="text-slate-500">
                      {gap.gapPercentage}% gap ({gap.studentsHaving}/{gap.studentsTotal} have it)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-red-500 to-amber-500"
                      style={{ width: `${gap.gapPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
