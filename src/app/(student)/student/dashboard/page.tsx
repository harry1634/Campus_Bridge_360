import * as React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/firebase/session";
import { getStudentProfile } from "@/lib/data/students";
import { getPublishedJobs } from "@/lib/data/jobs";
import { getApplicationsForStudent } from "@/lib/data/applications";
import { getExams } from "@/lib/data/exams";
import { recommendJobs } from "@/lib/business/recommendation";
import { evaluateEligibility } from "@/lib/business/eligibility";
import { computeProfileCompletion } from "@/lib/business/profile-completion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecommendedJobsWidget, type DashboardJobMatch } from "./recommended-jobs-widget";
import { ProgressRing } from "@/components/shared/progress-ring";
import type { Application, ApplicationStatus } from "@/lib/types";
import {
  ArrowRight,
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Trophy,
  Users,
} from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// NOTE: The applications table below is still illustrative sample data — the
// dedicated applications live view is a separate page already wired to real
// Firestore data. Profile fields, stat cards, the placement journey band and
// the Recommended Jobs section are all real.

// Furthest stage each application status represents, for rolling up the
// placement-journey counts. "rejected" isn't a stage of its own — it just
// means the application stopped progressing wherever it last was.
const STAGE_RANK: Record<ApplicationStatus, number> = {
  applied: 0,
  shortlisted: 1,
  assessment: 2,
  technical_interview: 3,
  hr_interview: 3,
  selected: 4,
  rejected: -1,
};

function furthestStageReached(app: Application): number {
  const statuses = app.statusHistory.length > 0 ? app.statusHistory.map((h) => h.status) : [app.status];
  const ranks = statuses.map((s) => STAGE_RANK[s]).filter((r) => r >= 0);
  return ranks.length > 0 ? Math.max(...ranks) : 0;
}

const applications = [
  {
    company: "TCS",
    initial: "T",
    color: "bg-teal-50 text-teal-600",
    role: "Software Engineer",
    date: "20 May 2026",
    status: "Assessment",
    statusColor: "bg-teal-50 text-teal-700",
    nextStep: "Aptitude Test",
    nextStepDate: "25 May 2026",
  },
  {
    company: "Infosys",
    initial: "I",
    color: "bg-indigo-50 text-indigo-600",
    role: "System Engineer",
    date: "18 May 2026",
    status: "Shortlisted",
    statusColor: "bg-emerald-50 text-emerald-700",
    nextStep: "Technical Interview",
    nextStepDate: "30 May 2026",
  },
  {
    company: "Accenture",
    initial: ">",
    color: "bg-slate-100 text-slate-600",
    role: "SDE Intern",
    date: "15 May 2026",
    status: "Applied",
    statusColor: "bg-amber-50 text-amber-700",
    nextStep: null,
    nextStepDate: null,
  },
];

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getStudentProfile(user.uid);
  if (!profile) redirect("/login");

  const { percentage, missingFields } = computeProfileCompletion(profile);
  const firstName = profile.name.split(" ")[0];

  const [jobs, studentApplications, exams] = await Promise.all([
    getPublishedJobs(),
    getApplicationsForStudent(user.uid),
    getExams(),
  ]);
  const appliedJobIds = studentApplications.map((a) => a.jobId);

  const eligibleJobsCount = jobs.filter((j) => evaluateEligibility(profile, j.eligibility).eligible).length;
  const today = new Date();
  const upcomingExamsCount = exams.filter(
    (e) => evaluateEligibility(profile, e.eligibility).eligible && new Date(e.date) >= today
  ).length;
  const interviewsCount = studentApplications.filter(
    (a) => a.status === "technical_interview" || a.status === "hr_interview"
  ).length;

  const statCards = [
    { icon: Briefcase, label: "Eligible Jobs", value: eligibleJobsCount, href: "/student/jobs/eligible", cta: "View jobs", color: "bg-teal-50 text-teal-600" },
    { icon: ClipboardList, label: "Applications", value: studentApplications.length, href: "/student/applications", cta: "View all", color: "bg-emerald-50 text-emerald-600" },
    { icon: Calendar, label: "Upcoming Exams", value: upcomingExamsCount, href: "/student/exams", cta: "View exams", color: "bg-purple-50 text-purple-600" },
    { icon: Users, label: "Interviews", value: interviewsCount, href: "/student/applications", cta: "View schedule", color: "bg-amber-50 text-amber-600" },
  ];

  const stageCounts = [0, 1, 2, 3, 4].map(
    (rank) => studentApplications.filter((a) => furthestStageReached(a) >= rank).length
  );
  const maxStageReached = studentApplications.length > 0 ? Math.max(...studentApplications.map(furthestStageReached)) : -1;
  const journeyLabels = ["Applied", "Shortlisted", "Assessment", "Interview", "Offer"];
  const journeySteps = journeyLabels.map((label, i) => ({
    label,
    count: stageCounts[i],
    state: stageCounts[i] === 0 ? "upcoming" : i === maxStageReached ? "current" : "done",
  }));

  const offerCount = stageCounts[4];
  const journeyMessage =
    offerCount > 0
      ? { title: "Congratulations! 🎉", body: "You've received an offer — check your applications for next steps." }
      : interviewsCount > 0
        ? { title: "You're in the interview stage!", body: "Keep preparing — you're almost there." }
        : studentApplications.length > 0
          ? { title: "Keep going!", body: "You're on your way to success." }
          : { title: "Get started", body: "Browse eligible jobs and submit your first application." };

  const topMatches: DashboardJobMatch[] = recommendJobs(profile, jobs, 3).map((match) => {
    const job = jobs.find((j) => j.id === match.jobId)!;
    const eligibility = evaluateEligibility(profile, job.eligibility);
    return {
      jobId: match.jobId,
      jobTitle: match.jobTitle,
      companyName: match.companyName,
      matchScore: match.matchScore,
      location: job.location,
      package: job.package,
      skills: match.matchedSkills.length > 0 ? match.matchedSkills : job.requiredSkills,
      eligible: eligibility.eligible,
      cgpaOk: eligibility.checks.find((c) => c.key === "cgpa")?.passed ?? false,
      backlogsOk: eligibility.checks.find((c) => c.key === "backlogs")?.passed ?? false,
    };
  });

  return (
    <div className="space-y-8">
      {/* Greeting header */}
      <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-start justify-between gap-6 p-6 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                {getGreeting()}, {firstName}! 👋
              </h1>
              <p className="mt-1 text-slate-500">Let&apos;s make progress towards your dream career.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" /> {profile.department}
                </Badge>
                <Badge variant="purple" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Batch {profile.batch}
                </Badge>
                <Badge variant="success" className="flex items-center gap-1">
                  <Award className="h-3 w-3" /> CGPA: {profile.cgpa || "—"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/student/profile"
              className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition-colors hover:border-teal-200 hover:bg-teal-50/50"
            >
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                <ProgressRing percentage={percentage} size={56} strokeWidth={5} />
                <span className="absolute text-xs font-bold text-slate-900">{percentage}%</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {percentage >= 100 ? "Profile complete" : "Complete your profile"}
                </p>
                <p className="text-xs text-slate-500 group-hover:text-teal-700">
                  {percentage >= 100
                    ? "You're all set for better matches."
                    : `${missingFields.length} field${missingFields.length === 1 ? "" : "s"} left`}
                </p>
              </div>
            </Link>

            <div className="animate-float-slow hidden shrink-0 lg:block">
              <Image src="/student-avatar.svg" alt="" width={160} height={128} priority />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card
            key={stat.label}
            className={`animate-fade-in-up transition-shadow duration-300 hover:shadow-md ${
              ["delay-100", "delay-200", "delay-300"][i % 3]
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
              <Link href={stat.href}>
                <Button variant="link" className="group mt-2 h-auto px-0 text-xs">
                  {stat.cta}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placement journey band */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <h2 className="mb-5 text-base font-semibold text-slate-900">Placement Journey</h2>
            <div className="flex items-center">
              {journeySteps.map((step, i) => (
                <React.Fragment key={step.label}>
                  {i > 0 && (
                    <div
                      className={`h-0.5 flex-1 ${step.state !== "upcoming" ? "bg-emerald-500" : "bg-slate-200"}`}
                    />
                  )}
                  <div className="flex flex-col items-center gap-1.5 px-1">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                        step.state === "done"
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : step.state === "current"
                            ? "border-teal-600 text-teal-600"
                            : "border-slate-200 text-slate-300"
                      }`}
                    >
                      {step.state === "done" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : step.state === "current" ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                      ) : null}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{step.label}</span>
                    <span className="text-xs text-slate-400">{step.count}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-5 py-4 lg:w-72">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-amber-500">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">{journeyMessage.title}</p>
              <p className="text-xs text-emerald-700">{journeyMessage.body}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended jobs */}
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recommended for You</h2>
          <Link href="/student/jobs/recommended">
            <Button variant="link" className="group h-auto px-0 text-sm">
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          aria-label="Scroll left"
          className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-md hover:text-slate-700 lg:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-md hover:text-slate-700 lg:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <RecommendedJobsWidget jobs={topMatches} appliedJobIds={appliedJobIds} />
      </div>

      {/* My applications */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">My Applications</h2>
            <Link href="/student/applications">
              <Button variant="link" className="group h-auto px-0 text-sm">
                View all
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="pb-2 font-medium">Company</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="hidden pb-2 font-medium sm:table-cell">Applied On</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="hidden pb-2 font-medium md:table-cell">Next Step</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.company} className="border-b border-slate-50 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${app.color}`}>
                          {app.initial}
                        </div>
                        {app.company}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{app.role}</td>
                    <td className="hidden py-3 text-slate-500 sm:table-cell">{app.date}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${app.statusColor}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="hidden py-3 md:table-cell">
                      {app.nextStep ? (
                        <div>
                          <p className="text-xs font-medium text-slate-700">{app.nextStep}</p>
                          <p className="text-xs text-slate-400">{app.nextStepDate}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
