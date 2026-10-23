import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getMentors, getMentorshipRequestsForStudent } from "@/lib/data/mentors";
import { StudentMentorsClient } from "./mentors-client";

export default async function StudentMentorsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [mentors, requests] = await Promise.all([
    getMentors(),
    getMentorshipRequestsForStudent(user.uid),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mentors</h1>
        <p className="mt-1 text-slate-500">Request guidance from industry mentors.</p>
      </div>
      <StudentMentorsClient mentors={mentors} requestedMentorIds={requests.map((r) => r.mentorId)} />
    </div>
  );
}
