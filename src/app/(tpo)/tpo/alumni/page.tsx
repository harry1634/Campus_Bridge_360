import { getAlumni } from "@/lib/data/alumni";
import { AlumniClient } from "./alumni-client";

export default async function TpoAlumniPage() {
  const alumni = await getAlumni();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alumni</h1>
        <p className="mt-1 text-slate-500">Manage alumni records visible to students.</p>
      </div>
      <AlumniClient alumni={alumni} />
    </div>
  );
}
