"use client";

import * as React from "react";
import type { Application, StudentProfile } from "@/lib/types";
import { downloadCsv } from "@/lib/business/csv-export";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type ReportType = "company" | "department" | "batch" | "job" | "placement";

const SHORTLISTED_OR_LATER = new Set([
  "shortlisted",
  "assessment",
  "technical_interview",
  "hr_interview",
  "selected",
]);

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return map;
}

export function ReportsClient({
  applications,
  students,
}: {
  applications: Application[];
  students: StudentProfile[];
}) {
  const [reportType, setReportType] = React.useState<ReportType>("company");

  const batchByStudentId = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const s of students) map.set(s.studentId, s.batch);
    return map;
  }, [students]);

  const rows = React.useMemo(() => {
    if (reportType === "placement") {
      return applications
        .filter((a) => a.status === "selected")
        .map((a) => ({
          Student: a.studentName,
          "Student ID": a.studentId,
          Department: a.department,
          Company: a.companyName,
          "Selected Date": new Date(a.appliedAt).toLocaleDateString("en-IN"),
        }));
    }

    const keyFn: Record<Exclude<ReportType, "placement">, (a: Application) => string> = {
      company: (a) => a.companyName,
      department: (a) => a.department,
      batch: (a) => batchByStudentId.get(a.studentId) ?? "Unknown",
      job: (a) => `${a.companyName}`,
    };

    const grouped = groupBy(applications, keyFn[reportType as Exclude<ReportType, "placement">]);
    return Array.from(grouped.entries()).map(([key, apps]) => ({
      [reportType === "company" ? "Company" : reportType === "department" ? "Department" : reportType === "batch" ? "Batch" : "Job"]:
        key,
      Applied: apps.length,
      Shortlisted: apps.filter((a) => SHORTLISTED_OR_LATER.has(a.status)).length,
      Selected: apps.filter((a) => a.status === "selected").length,
    }));
  }, [applications, reportType, batchByStudentId]);

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value as ReportType)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm sm:w-56"
        >
          <option value="company">Company-wise</option>
          <option value="department">Department-wise</option>
          <option value="batch">Batch-wise</option>
          <option value="job">Job-wise</option>
          <option value="placement">Placement-wise</option>
        </select>
        <Button
          variant="outline"
          onClick={() => downloadCsv(`${reportType}-report.csv`, rows)}
          disabled={rows.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {rows.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No data available for this report yet.</p>
          ) : (
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                  {columns.map((col) => (
                    <th key={col} className="px-5 py-3 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    {columns.map((col) => (
                      <td key={col} className="px-5 py-3 text-slate-700">
                        {String(row[col as keyof typeof row])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
