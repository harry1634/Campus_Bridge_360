import { getAllApplications } from "@/lib/data/applications";
import { getAllStudents } from "@/lib/data/students";
import { getCompanies } from "@/lib/data/companies";
import { getDrives } from "@/lib/data/drives";
import {
  computeApplicationsOverTime,
  computeDepartmentPlacement,
  computeStatusDistribution,
  computeTopCompanies,
} from "@/lib/business/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsClient } from "./analytics-client";

export default async function TpoAnalyticsPage() {
  const [applications, students, companies, drives] = await Promise.all([
    getAllApplications(),
    getAllStudents(),
    getCompanies(),
    getDrives(),
  ]);

  const shortlistedOrLater = new Set([
    "shortlisted",
    "assessment",
    "technical_interview",
    "hr_interview",
    "selected",
  ]);

  const totals = [
    { label: "Total Students", value: students.length },
    { label: "Total Companies", value: companies.length },
    { label: "Placement Drives", value: drives.length },
    { label: "Total Applications", value: applications.length },
    { label: "Shortlisted", value: applications.filter((a) => shortlistedOrLater.has(a.status)).length },
    {
      label: "Interviews",
      value: applications.filter((a) => a.status === "technical_interview" || a.status === "hr_interview").length,
    },
    { label: "Selected", value: applications.filter((a) => a.status === "selected").length },
    {
      label: "Placement %",
      value:
        students.length > 0
          ? `${Math.round((applications.filter((a) => a.status === "selected").length / students.length) * 100)}%`
          : "0%",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Placement Analytics</h1>
        <p className="mt-1 text-slate-500">High-level placement performance across the college.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {totals.map((t) => (
          <Card key={t.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">{t.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-slate-900">{t.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnalyticsClient
        statusDistribution={computeStatusDistribution(applications)}
        departmentPlacement={computeDepartmentPlacement(applications)}
        topCompanies={computeTopCompanies(applications)}
        applicationsOverTime={computeApplicationsOverTime(applications)}
      />
    </div>
  );
}
