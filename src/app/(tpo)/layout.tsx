import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getAllApplications } from "@/lib/data/applications";
import { TpoSidebar } from "@/components/layout/tpo-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { MobileNavProvider } from "@/components/layout/mobile-nav-context";

export default async function TpoLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "tpo") redirect("/student/dashboard");

  const applications = await getAllApplications();
  const pendingApplications = applications.filter(
    (a) => a.status !== "selected" && a.status !== "rejected"
  ).length;

  return (
    <MobileNavProvider>
      <div className="flex min-h-screen bg-slate-50">
        <TpoSidebar pendingApplications={pendingApplications} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppTopbar userEmail={user.email} role="tpo" />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
