import { getAlumni } from "@/lib/data/alumni";
import { StudentAlumniClient } from "./alumni-client";

export default async function StudentAlumniPage() {
  const alumni = await getAlumni();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alumni</h1>
        <p className="mt-1 text-slate-500">Connect with alumni working at top companies.</p>
      </div>
      <StudentAlumniClient alumni={alumni} />
    </div>
  );
}
