import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getStudentProfile } from "@/lib/data/students";
import { getPublishedJobs } from "@/lib/data/jobs";
import { ResumeMatchClient } from "./resume-match-client";

export default async function ResumeMatchPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const student = await getStudentProfile(user.uid);
  if (!student) redirect("/login");

  const jobs = await getPublishedJobs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resume & Job Match</h1>
        <p className="mt-1 text-slate-500">
          Compare your profile skills against a job&apos;s requirements — rule-based keyword
          matching only, no fabricated experience.
        </p>
      </div>
      <ResumeMatchClient jobs={jobs} studentSkills={student.skills} />
    </div>
  );
}
