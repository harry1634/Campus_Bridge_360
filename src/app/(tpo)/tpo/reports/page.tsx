import { getAllApplications } from "@/lib/data/applications";
import { getAllStudents } from "@/lib/data/students";
import { ReportsClient } from "./reports-client";

export default async function TpoReportsPage() {
  const [applications, students] = await Promise.all([getAllApplications(), getAllStudents()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-slate-500">
          Generate and export placement reports by company, department, batch, job or selection.
        </p>
      </div>
      <ReportsClient applications={applications} students={students} />
    </div>
  );
}
