import { getUpdates } from "@/lib/data/updates";
import { UpdatesClient } from "./updates-client";

export default async function TpoUpdatesPage() {
  const updates = await getUpdates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Placement Updates</h1>
        <p className="mt-1 text-slate-500">Publish announcements and notices to students.</p>
      </div>
      <UpdatesClient updates={updates} />
    </div>
  );
}
