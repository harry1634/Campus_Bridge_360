import { getDrives } from "@/lib/data/drives";
import { getCompanies } from "@/lib/data/companies";
import { DrivesClient } from "./drives-client";

export default async function TpoDrivesPage() {
  const [drives, companies] = await Promise.all([getDrives(), getCompanies()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Placement Drives</h1>
        <p className="mt-1 text-slate-500">Schedule and manage company placement drives.</p>
      </div>
      <DrivesClient drives={drives} companies={companies} />
    </div>
  );
}
