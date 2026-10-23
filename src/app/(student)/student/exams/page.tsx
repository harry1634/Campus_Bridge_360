import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getStudentProfile } from "@/lib/data/students";
import { getExams } from "@/lib/data/exams";
import { evaluateEligibility } from "@/lib/business/eligibility";
import { StudentExamsClient } from "./exams-client";

export default async function StudentExamsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const student = await getStudentProfile(user.uid);
  if (!student) redirect("/login");

  const exams = await getExams();
  const eligibleExams = exams.filter((e) => evaluateEligibility(student, e.eligibility).eligible);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Placement Exams</h1>
        <p className="mt-1 text-slate-500">Upcoming exams you're eligible for.</p>
      </div>
      <StudentExamsClient exams={eligibleExams} />
    </div>
  );
}
