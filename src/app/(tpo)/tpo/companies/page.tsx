import { getCompanies } from "@/lib/data/companies";
import { CompaniesClient } from "./companies-client";

export default async function TpoCompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
        <p className="mt-1 text-slate-500">Manage recruiting companies for placement drives.</p>
      </div>
      <CompaniesClient companies={companies} />
    </div>
  );
}
