import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getApplicationsForStudent } from "@/lib/data/applications";
import { ApplicationsList } from "./applications-list";

export default async function StudentApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const applications = await getApplicationsForStudent(user.uid);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
        <p className="mt-1 text-slate-500">
          Track the status of every job you&apos;ve applied to, end to end.
        </p>
      </div>

      <ApplicationsList applications={applications} />
    </div>
  );
}
