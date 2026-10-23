import { notFound } from "next/navigation";
import { getJob } from "@/lib/data/jobs";
import { getAllStudents } from "@/lib/data/students";
import { getApplicationsForJob } from "@/lib/data/applications";
import { computeDepartmentBreakdown } from "@/lib/business/department-breakdown";
import { Badge } from "@/components/ui/badge";
import { JobDetailClient } from "./job-detail-client";

export default async function TpoJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = await getJob(jobId);
  if (!job) notFound();

  const [students, applications] = await Promise.all([
    getAllStudents(),
    getApplicationsForJob(jobId),
  ]);

  const departmentStats = computeDepartmentBreakdown(students, applications, job.eligibility);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <Badge variant="outline" className="capitalize">
              {job.status}
            </Badge>
          </div>
          <p className="mt-1 text-slate-500">
            {job.companyName} · {job.location} · {job.package} · Drive:{" "}
            {job.driveDate ? new Date(job.driveDate).toLocaleDateString("en-IN") : "TBD"}
          </p>
        </div>
      </div>

      <JobDetailClient departmentStats={departmentStats} applications={applications} />
    </div>
  );
}
