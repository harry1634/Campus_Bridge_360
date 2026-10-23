import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getStudentProfile } from "@/lib/data/students";
import { getUpdates } from "@/lib/data/updates";
import { StudentUpdatesClient } from "./updates-client";

export default async function StudentUpdatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const student = await getStudentProfile(user.uid);
  if (!student) redirect("/login");

  const updates = await getUpdates();
  const relevantUpdates = updates.filter(
    (u) => u.audience === "all" || u.audience.includes(student.department)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Placement Updates</h1>
        <p className="mt-1 text-slate-500">Announcements and notices from your placement office.</p>
      </div>
      <StudentUpdatesClient updates={relevantUpdates} />
    </div>
  );
}
