import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getNotificationsForUser } from "@/lib/data/notifications";
import { NotificationsList } from "@/components/shared/notifications-list";

export default async function StudentNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await getNotificationsForUser(user.uid);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="mt-1 text-slate-500">Stay on top of your applications and placement activity.</p>
      </div>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
