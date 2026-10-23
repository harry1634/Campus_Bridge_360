import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getStudentProfile } from "@/lib/data/students";
import { getPublishedJobs } from "@/lib/data/jobs";
import { getApplicationsForStudent } from "@/lib/data/applications";
import { recommendJobs } from "@/lib/business/recommendation";
import { RecommendedJobsClient } from "./recommended-jobs-client";

export default async function RecommendedJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const student = await getStudentProfile(user.uid);
  if (!student) redirect("/login");

  const [jobs, applications] = await Promise.all([
    getPublishedJobs(),
    getApplicationsForStudent(user.uid),
  ]);

  const matches = recommendJobs(student, jobs, 12);
  const appliedJobIds = applications.map((a) => a.jobId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recommended for You</h1>
        <p className="mt-1 text-slate-500">
          Rule-based matches comparing your skills, CGPA and preferences against job requirements.
        </p>
      </div>
      <RecommendedJobsClient matches={matches} appliedJobIds={appliedJobIds} />
    </div>
  );
}
