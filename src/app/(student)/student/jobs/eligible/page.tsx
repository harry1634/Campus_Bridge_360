import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getStudentProfile } from "@/lib/data/students";
import { getPublishedJobs } from "@/lib/data/jobs";
import { getApplicationsForStudent } from "@/lib/data/applications";
import { evaluateEligibility } from "@/lib/business/eligibility";
import { EligibleJobsClient } from "./eligible-jobs-client";

export default async function EligibleJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const student = await getStudentProfile(user.uid);
  if (!student) redirect("/login");

  const [jobs, applications] = await Promise.all([
    getPublishedJobs(),
    getApplicationsForStudent(user.uid),
  ]);

  const eligibleJobs = jobs.filter((job) => evaluateEligibility(student, job.eligibility).eligible);
  const appliedJobIds = applications.map((a) => a.jobId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Eligible Jobs</h1>
        <p className="mt-1 text-slate-500">
          Opportunities you qualify for, based on your department, CGPA, backlogs and batch.
        </p>
      </div>
      <EligibleJobsClient jobs={eligibleJobs} appliedJobIds={appliedJobIds} />
    </div>
  );
}
