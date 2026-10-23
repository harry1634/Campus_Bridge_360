import { getAllStudents } from "@/lib/data/students";
import { getJobs } from "@/lib/data/jobs";
import { SkillGapsClient } from "./skill-gaps-client";

export default async function TpoSkillGapsPage() {
  const [students, jobs] = await Promise.all([getAllStudents(), getJobs()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Skill Gap Analysis</h1>
        <p className="mt-1 text-slate-500">
          Rule-based comparison of student skills against job requirements.
        </p>
      </div>
      <SkillGapsClient students={students} jobs={jobs} />
    </div>
  );
}
