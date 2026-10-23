import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getStudentProfile } from "@/lib/data/students";
import { computeProfileCompletion } from "@/lib/business/profile-completion";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { MobileNavProvider } from "@/components/layout/mobile-nav-context";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/tpo/dashboard");

  const profile = await getStudentProfile(user.uid);
  const { percentage } = profile
    ? computeProfileCompletion(profile)
    : { percentage: 0 };

  return (
    <MobileNavProvider>
      <div className="flex min-h-screen bg-slate-50">
        <StudentSidebar profileCompletion={percentage} />
        <div className="flex-1 flex flex-col min-w-0">
          <AppTopbar
            userEmail={user.email}
            userName={profile?.name}
            role="student"
            searchPlaceholder="Search jobs, companies, alumni, mentors..."
          />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
