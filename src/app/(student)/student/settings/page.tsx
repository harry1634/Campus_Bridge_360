import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { SettingsClient } from "./settings-client";

export default async function StudentSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">Manage your account and session.</p>
      </div>
      <SettingsClient email={user.email} />
    </div>
  );
}
