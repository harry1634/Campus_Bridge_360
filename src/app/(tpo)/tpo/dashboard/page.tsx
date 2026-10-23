import Link from "next/link";
import { getDrives } from "@/lib/data/drives";
import { getAllApplications } from "@/lib/data/applications";
import { getAllStudents } from "@/lib/data/students";
import { getJobs } from "@/lib/data/jobs";
import { batchesMatchCycle, resolveCycle } from "@/lib/business/academic-cycle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AcademicCycleSelect } from "./academic-cycle-select";
import type { Application, Job, PlacementDrive, StudentProfile } from "@/lib/types";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  Megaphone,
  UserPlus,
  Users,
} from "lucide-react";

const quickActions = [
  { label: "Add Company", href: "/tpo/companies", icon: Building2, color: "bg-emerald-50 text-emerald-600" },
  { label: "Post a Job", href: "/tpo/jobs", icon: Briefcase, color: "bg-teal-50 text-teal-600" },
  { label: "Schedule Drive", href: "/tpo/drives", icon: CalendarDays, color: "bg-purple-50 text-purple-600" },
  { label: "Import Students", href: "/tpo/students/import", icon: UserPlus, color: "bg-amber-50 text-amber-600" },
  { label: "Add Exam", href: "/tpo/exams", icon: GraduationCap, color: "bg-rose-50 text-rose-600" },
  { label: "Post an Update", href: "/tpo/updates", icon: Megaphone, color: "bg-blue-50 text-blue-600" },
  { label: "Invite TPO", href: "/tpo/team", icon: UserPlus, color: "bg-slate-100 text-slate-600" },
];

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
  applied: "default",
  shortlisted: "warning",
  assessment: "warning",
  technical_interview: "warning",
  hr_interview: "warning",
  selected: "success",
  rejected: "destructive",
};

function statsForCycle(
  endYear: number,
  students: StudentProfile[],
  jobs: Job[],
  drives: PlacementDrive[],
  applications: Application[]
) {
  const studentsInCycle = students.filter((s) => s.graduationYear === endYear);
  const studentUidsInCycle = new Set(studentsInCycle.map((s) => s.uid));
  const jobsInCycle = jobs.filter((j) => batchesMatchCycle(j.eligibility.batches, endYear));
  const drivesInCycle = drives.filter((d) => batchesMatchCycle(d.eligibility.batches, endYear));
  const companyIds = new Set([
    ...jobsInCycle.map((j) => j.companyId),
    ...drivesInCycle.map((d) => d.companyId),
  ]);
  const applicationsInCycle = applications.filter((a) => studentUidsInCycle.has(a.studentUid));
  const pending = applicationsInCycle.filter((a) => a.status !== "selected" && a.status !== "rejected");

  return {
    students: studentsInCycle.length,
    companies: companyIds.size,
    jobs: jobsInCycle.length,
    drives: drivesInCycle.length,
    applications: applicationsInCycle.length,
    pending: pending.length,
    recentDrives: drivesInCycle.slice(0, 5),
    recentApplications: applicationsInCycle.slice(0, 5),
  };
}

function trend(current: number, previous: number): { label: string; positive: boolean } {
  if (previous === 0) {
    return current > 0 ? { label: "New this cycle", positive: true } : { label: "0% vs last cycle", positive: true };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return { label: `${pct >= 0 ? "+" : ""}${pct}% vs last cycle`, positive: pct >= 0 };
}

export default async function TpoDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string }>;
}) {
  const { cycle: cycleParam } = await searchParams;
  const cycle = resolveCycle(cycleParam);

  const [students, jobs, drives, applications] = await Promise.all([
    getAllStudents(),
    getJobs(),
    getDrives(),
    getAllApplications(),
  ]);

  const current = statsForCycle(cycle.endYear, students, jobs, drives, applications);
  const previous = statsForCycle(cycle.endYear - 1, students, jobs, drives, applications);

  const cards = [
    {
      label: "Total Students",
      value: current.students,
      icon: Users,
      href: "/tpo/students",
      trend: trend(current.students, previous.students),
    },
    {
      label: "Total Companies",
      value: current.companies,
      icon: Building2,
      href: "/tpo/companies",
      trend: trend(current.companies, previous.companies),
    },
    {
      label: "Jobs Posted",
      value: current.jobs,
      icon: Briefcase,
      href: "/tpo/jobs",
      trend: trend(current.jobs, previous.jobs),
    },
    {
      label: "Placement Drives",
      value: current.drives,
      icon: CalendarDays,
      href: "/tpo/drives",
      trend: trend(current.drives, previous.drives),
    },
    {
      label: "Applications",
      value: current.applications,
      icon: FileText,
      href: "/tpo/applications",
      trend: trend(current.applications, previous.applications),
    },
    {
      label: "Pending Review",
      value: current.pending,
      icon: GraduationCap,
      href: "/tpo/applications",
      cta: "View pending",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Placement Overview</h1>
          <p className="text-slate-500">
            Showing data for the <span className="font-medium text-slate-700">{cycle.label}</span> placement cycle
            (students graduating in {cycle.endYear}).
          </p>
        </div>
        <AcademicCycleSelect />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p className="pt-2.5 text-sm font-medium text-slate-500">{card.label}</p>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
                {card.cta ? (
                  <span className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
                    {card.cta} <ArrowRight className="h-3 w-3" />
                  </span>
                ) : (
                  <span
                    className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                      card.trend!.positive ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    <ArrowUpRight className={`h-3 w-3 ${card.trend!.positive ? "" : "rotate-90"}`} />
                    {card.trend!.label}
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recent Placement Drives</h2>
              <Link href="/tpo/drives" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {current.recentDrives.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No drives in this cycle"
                description="Create a placement drive or pick a different cycle."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {current.recentDrives.map((d) => (
                  <Link
                    key={d.id}
                    href="/tpo/drives"
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-slate-50/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{d.companyName}</p>
                      <p className="truncate text-xs text-slate-500">
                        {d.jobRole} · {d.location}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {d.package}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" /> {d.driveDate}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
              <Link
                href="/tpo/applications"
                className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {current.recentApplications.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No applications in this cycle"
                description="Applications from students graduating in this cycle will appear here."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {current.recentApplications.map((a) => (
                  <Link
                    key={a.id}
                    href="/tpo/applications"
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-slate-50/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{a.studentName}</p>
                      <p className="truncate text-xs text-slate-500">{a.companyName}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge variant={statusVariant[a.status] ?? "default"} className="capitalize">
                        {a.status.replace(/_/g, " ")}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
