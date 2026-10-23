import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getStudentProfile } from "@/lib/data/students";
import { getDrives } from "@/lib/data/drives";
import { evaluateEligibility } from "@/lib/business/eligibility";
import { StudentDrivesClient } from "./drives-client";

export default async function StudentDrivesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const student = await getStudentProfile(user.uid);
  if (!student) redirect("/login");

  const drives = await getDrives();
  const eligibleDrives = drives.filter((d) => evaluateEligibility(student, d.eligibility).eligible);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Placement Drives</h1>
        <p className="mt-1 text-slate-500">Drives you're eligible for, based on your academic profile.</p>
      </div>
      <StudentDrivesClient drives={eligibleDrives} />
    </div>
  );
}
