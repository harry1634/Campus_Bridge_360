import { getExams } from "@/lib/data/exams";
import { getCompanies } from "@/lib/data/companies";
import { ExamsClient } from "./exams-client";

export default async function TpoExamsPage() {
  const [exams, companies] = await Promise.all([getExams(), getCompanies()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Placement Exams</h1>
        <p className="mt-1 text-slate-500">Create and manage placement exam entries.</p>
      </div>
      <ExamsClient exams={exams} companies={companies} />
    </div>
  );
}
