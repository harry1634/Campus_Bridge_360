import { getAllApplications } from "@/lib/data/applications";
import { ApplicationsClient } from "./applications-client";

export default async function TpoApplicationsPage() {
  const applications = await getAllApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <p className="mt-1 text-slate-500">
          Review applications and manage recruitment stage transitions.
        </p>
      </div>
      <ApplicationsClient applications={applications} />
    </div>
  );
}
