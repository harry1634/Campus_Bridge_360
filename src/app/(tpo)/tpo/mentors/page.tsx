import { getMentors } from "@/lib/data/mentors";
import { MentorsClient } from "./mentors-client";

export default async function TpoMentorsPage() {
  const mentors = await getMentors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mentors</h1>
        <p className="mt-1 text-slate-500">Manage mentor records visible to students.</p>
      </div>
      <MentorsClient mentors={mentors} />
    </div>
  );
}
