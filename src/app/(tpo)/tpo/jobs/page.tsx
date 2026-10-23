import { getJobs } from "@/lib/data/jobs";
import { getCompanies } from "@/lib/data/companies";
import { JobsClient } from "./jobs-client";

export default async function TpoJobsPage() {
  const [jobs, companies] = await Promise.all([getJobs(), getCompanies()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        <p className="mt-1 text-slate-500">
          Create job postings, set eligibility criteria, and manage their lifecycle.
        </p>
      </div>
      <JobsClient jobs={jobs} companies={companies} />
    </div>
  );
}
