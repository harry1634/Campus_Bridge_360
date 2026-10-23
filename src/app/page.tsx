"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

const heroStats = [
  { icon: Users, label: "Students", value: "10K+", color: "text-teal-600 bg-teal-50" },
  { icon: Building2, label: "Companies", value: "500+", color: "text-emerald-600 bg-emerald-50" },
  { icon: LineChart, label: "Placement Efficiency", value: "95%", color: "text-amber-600 bg-amber-50" },
  { icon: ShieldCheck, label: "Career Support", value: "24/7", color: "text-rose-600 bg-rose-50" },
];

const features = [
  {
    icon: Briefcase,
    title: "Smart Eligibility",
    description: "Automated eligibility based on CGPA, backlogs, department & more.",
    color: "bg-teal-50 text-teal-600",
    bar: "bg-teal-500",
  },
  {
    icon: LineChart,
    title: "Placement Analytics",
    description: "Real-time insights and reports to track performance across departments.",
    color: "bg-emerald-50 text-emerald-600",
    bar: "bg-emerald-500",
  },
  {
    icon: Users,
    title: "Alumni & Mentors",
    description: "Connect with alumni and mentors for guidance and career growth.",
    color: "bg-purple-50 text-purple-600",
    bar: "bg-purple-500",
  },
  {
    icon: FileText,
    title: "Job & Drive Management",
    description: "Manage jobs, drives and applications in one centralized platform.",
    color: "bg-amber-50 text-amber-600",
    bar: "bg-amber-500",
  },
  {
    icon: GraduationCap,
    title: "Placement Exams",
    description: "Schedule and manage placement exams and assessments easily.",
    color: "bg-teal-50 text-teal-600",
    bar: "bg-teal-500",
  },
  {
    icon: Bell,
    title: "Placement Updates",
    description: "Instant updates and notifications for every important activity.",
    color: "bg-rose-50 text-rose-600",
    bar: "bg-rose-500",
  },
];

const howItWorks = [
  {
    icon: UserPlus,
    title: "Create your account",
    description: "Students and TPOs each get a tailored onboarding — no paperwork, no waiting on IT.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Sparkles,
    title: "Get matched instantly",
    description: "Our eligibility engine checks CGPA, backlogs, department and batch against every listing automatically.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: ClipboardList,
    title: "Apply & track",
    description: "One-click applications with live status updates — from shortlisted to interview to offer.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Trophy,
    title: "Get placed",
    description: "Students land offers with confidence; TPOs get full visibility across every drive in real time.",
    color: "bg-rose-50 text-rose-600",
  },
];

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Students" },
  { icon: Building2, label: "Companies" },
  { icon: Briefcase, label: "Jobs / Drives" },
  { icon: ClipboardList, label: "Applications" },
  { icon: GraduationCap, label: "Placement Exams" },
  { icon: Users, label: "Alumni & Mentors" },
  { icon: LineChart, label: "Skill Gap" },
  { icon: FileText, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

const recentDrives = [
  { company: "TCS", role: "Software Engineer", date: "20 Sep 2026", applications: 247, status: "Active" },
  { company: "Infosys", role: "System Engineer", date: "28 Sep 2026", applications: 180, status: "Active" },
  { company: "Wipro", role: "Project Engineer", date: "05 Oct 2026", applications: 120, status: "Upcoming" },
];

const skillGaps = [
  { skill: "DSA", gap: 48 },
  { skill: "AWS", gap: 41 },
  { skill: "SQL", gap: 35 },
  { skill: "System Design", gap: 28 },
  { skill: "Communication", gap: 20 },
];

const departmentShare = [
  { label: "CSE", value: 45, color: "#0d9488" },
  { label: "IT", value: 25, color: "#059669" },
  { label: "ECE", value: 15, color: "#0891b2" },
  { label: "EEE", value: 10, color: "#f59e0b" },
  { label: "MECH", value: 5, color: "#7c3aed" },
];

const recommendedJobs = [
  { company: "TCS", role: "Software Engineer", match: 92, package: "₹8.5 LPA" },
  { company: "Amazon", role: "SDE Intern", match: 87, package: "₹35K/mo" },
  { company: "Deloitte", role: "Analyst", match: 81, package: "₹6.2 LPA" },
];

const journeySteps = [
  { label: "Applied", state: "done" },
  { label: "Shortlisted", state: "done" },
  { label: "Assessment", state: "current" },
  { label: "Interview", state: "upcoming" },
  { label: "Offer", state: "upcoming" },
];

function buildConicGradient(segments: { value: number; color: string }[]) {
  let cursor = 0;
  const stops = segments.map((s) => {
    const start = cursor;
    cursor += s.value;
    return `${s.color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function parseStatValue(value: string): { target: number; suffix: string } | null {
  const match = value.match(/^([\d.]+)(.*)$/);
  if (!match) return null;
  const [, numStr, suffix] = match;
  if (suffix.includes("/")) return null;
  return { target: parseFloat(numStr), suffix };
}

function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let start: number | null = null;
    let raf: number;
    function step(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function StatValue({ value }: { value: string }) {
  const parsed = parseStatValue(value);
  const animated = useCountUp(parsed?.target ?? 0);
  if (!parsed) return <>{value}</>;
  const decimals = parsed.target % 1 !== 0 ? 1 : 0;
  return (
    <>
      {animated.toFixed(decimals)}
      {parsed.suffix}
    </>
  );
}

const mockupSlides = ["tpo", "student", "analytics"] as const;
type MockupSlide = (typeof mockupSlides)[number];

const slideMeta: Record<MockupSlide, { title: string; subtitle: string }> = {
  tpo: { title: "Good Morning, TPO 👋", subtitle: "Here's what's happening with placements today." },
  student: { title: "Welcome back, Ananya 👋", subtitle: "Your placement journey at a glance." },
  analytics: { title: "Placement Analytics", subtitle: "Department performance and skill readiness." },
};

function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-emerald-500 text-[10px] font-bold text-white">
          CB
        </div>
        <span className="text-xs font-semibold text-slate-700">Campus Bridge 360</span>
      </div>
      <div className="hidden items-center gap-2 rounded-md bg-slate-50 px-2 py-1 sm:flex">
        <Search className="h-3 w-3 text-slate-400" />
        <span className="text-[10px] text-slate-400">Search anything...</span>
      </div>
      <div className="flex items-center gap-2">
        <Bell className="h-3.5 w-3.5 text-slate-400" />
        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-teal-500" />
      </div>
    </div>
  );
}

function TpoSlide() {
  return (
    <div className="flex-1 space-y-3 p-3">
      <div>
        <p className="text-xs font-semibold text-slate-900">{slideMeta.tpo.title}</p>
        <p className="text-[10px] text-slate-400">{slideMeta.tpo.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Total Students", value: "4,850", delta: "+12%" },
          { label: "Active Drives", value: "124", delta: "+8%" },
          { label: "Applications", value: "8,420", delta: "+15%" },
          { label: "Offers", value: "632", delta: "+10%" },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
            <p className="text-[9px] text-slate-400">{card.label}</p>
            <p className="text-sm font-bold text-slate-900">{card.value}</p>
            <p className="text-[9px] font-medium text-emerald-600">{card.delta} this month</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10px] font-semibold text-slate-700">Applications Overview</p>
            <span className="text-[8px] font-medium text-emerald-600">↑ 15% vs last month</span>
          </div>
          <svg viewBox="0 0 200 60" className="h-14 w-full">
            <polyline
              points="0,45 30,35 60,40 90,20 120,30 150,10 180,18 200,8"
              fill="none"
              stroke="#0d9488"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
          <p className="mb-1 text-[10px] font-semibold text-slate-700">Applications by Department</p>
          <div className="flex items-center gap-2">
            <div
              className="relative h-14 w-14 shrink-0 rounded-full"
              style={{ background: buildConicGradient(departmentShare) }}
            >
              <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-[8px] font-bold text-slate-700">
                8,420
              </div>
            </div>
            <div className="space-y-0.5">
              {departmentShare.slice(0, 3).map((d) => (
                <div key={d.label} className="flex items-center gap-1 text-[8px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.label} {d.value}%
                </div>
              ))}
              <div className="flex items-center gap-1 text-[8px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Others {departmentShare.slice(3).reduce((sum, d) => sum + d.value, 0)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] font-semibold text-slate-700">Recent Placement Drives</p>
          <div className="space-y-1.5">
            {recentDrives.map((d) => (
              <div key={d.company} className="flex items-center justify-between text-[9px]">
                <span className="font-medium text-slate-700">{d.company}</span>
                <span className="text-slate-400">{d.applications} apps</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${
                    d.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] font-semibold text-slate-700">Top Skill Gaps</p>
          <div className="space-y-1.5">
            {skillGaps.map((s) => (
              <div key={s.skill}>
                <div className="flex justify-between text-[8px] text-slate-500">
                  <span>{s.skill}</span>
                  <span>{s.gap}%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-teal-600 to-indigo-500"
                    style={{ width: `${s.gap}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentSlide() {
  return (
    <div className="flex-1 space-y-3 p-3">
      <div>
        <p className="text-xs font-semibold text-slate-900">{slideMeta.student.title}</p>
        <p className="text-[10px] text-slate-400">{slideMeta.student.subtitle}</p>
      </div>

      <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
        <p className="mb-2 text-[10px] font-semibold text-slate-700">Application Journey</p>
        <div className="flex items-center">
          {journeySteps.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-bold ${
                    step.state === "done"
                      ? "bg-emerald-500 text-white"
                      : step.state === "current"
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {step.state === "done" ? <CheckCircle2 className="h-2.5 w-2.5" /> : i + 1}
                </div>
                <span className="text-[7px] text-slate-500">{step.label}</span>
              </div>
              {i < journeySteps.length - 1 && (
                <div
                  className={`mx-1 mb-3 h-0.5 flex-1 rounded-full ${
                    step.state === "done" ? "bg-emerald-500" : "bg-slate-100"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
        <p className="mb-2 text-[10px] font-semibold text-slate-700">Recommended Jobs</p>
        <div className="space-y-2">
          {recommendedJobs.map((job) => (
            <div key={job.company} className="flex items-center justify-between text-[9px]">
              <div>
                <p className="font-medium text-slate-700">{job.role}</p>
                <p className="text-slate-400">{job.company} · {job.package}</p>
              </div>
              <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[8px] font-semibold text-teal-600">
                {job.match}% match
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Eligible Jobs", value: "12" },
          { label: "Upcoming Exams", value: "2" },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
            <p className="text-[9px] text-slate-400">{card.label}</p>
            <p className="text-sm font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsSlide() {
  return (
    <div className="flex-1 space-y-3 p-3">
      <div>
        <p className="text-xs font-semibold text-slate-900">{slideMeta.analytics.title}</p>
        <p className="text-[10px] text-slate-400">{slideMeta.analytics.subtitle}</p>
      </div>

      <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
        <p className="mb-2 text-[10px] font-semibold text-slate-700">Department-wise Placement Rate</p>
        <div className="space-y-1.5">
          {departmentShare.map((d) => (
            <div key={d.label}>
              <div className="flex justify-between text-[8px] text-slate-500">
                <span>{d.label}</span>
                <span>{d.value * 2}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${d.value * 2}%`, backgroundColor: d.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Avg Package", value: "6.8 LPA" },
          { label: "Highest", value: "42 LPA" },
          { label: "Placed", value: "89%" },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-100 bg-white p-2 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-900">{card.value}</p>
            <p className="text-[8px] text-slate-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
        <p className="mb-2 text-[10px] font-semibold text-slate-700">Top Skill Gaps</p>
        <div className="space-y-1.5">
          {skillGaps.slice(0, 3).map((s) => (
            <div key={s.skill}>
              <div className="flex justify-between text-[8px] text-slate-500">
                <span>{s.skill}</span>
                <span>{s.gap}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-slate-100">
                <div
                  className="h-1 rounded-full bg-gradient-to-r from-purple-600 to-teal-500"
                  style={{ width: `${s.gap}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const slideComponents: Record<MockupSlide, React.ComponentType> = {
  tpo: TpoSlide,
  student: StudentSlide,
  analytics: AnalyticsSlide,
};

function HeroMockup() {
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % mockupSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [paused]);

  const ActiveSlide = slideComponents[mockupSlides[active]];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="animate-float-slow overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <TopBar />
        <div className="flex">
          <div className="hidden w-32 flex-col gap-0.5 border-r border-slate-100 p-2 sm:flex">
            {sidebarLinks.map((link) => (
              <div
                key={link.label}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors ${
                  link.active ? "bg-teal-50 text-teal-600" : "text-slate-500"
                }`}
              >
                <link.icon className="h-3 w-3" />
                {link.label}
              </div>
            ))}
          </div>
          <div key={active} className="flex flex-1 animate-fade-in-up">
            <ActiveSlide />
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {mockupSlides.map((slide, i) => (
          <button
            key={slide}
            onClick={() => setActive(i)}
            aria-label={`Show ${slide} preview`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-teal-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>

      <div className="animate-float-slow delay-300 absolute -right-4 -top-6 hidden rotate-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-lg sm:block">
        <p className="text-xs font-medium text-slate-900">✓ Application shortlisted</p>
        <p className="text-[11px] text-slate-400">ABC Technologies · SDE Intern</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100/80 bg-white/70 px-4 py-3 backdrop-blur-md sm:px-8 lg:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-sm font-bold text-white shadow-md shadow-teal-600/20">
            CB
          </div>
          <span className="text-lg font-bold text-slate-900">
            Campus <span className="text-teal-600">Bridge</span> <span className="text-emerald-600">360</span>
          </span>
        </div>
        <div className="flex gap-3">
          <Link href="/login?role=student">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button className="shadow-md shadow-teal-600/20 transition-transform hover:-translate-y-0.5">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Ambient gradient blobs replace the flat colored arc */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-blob absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="animate-blob delay-300 absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-purple-400/15 blur-3xl" />
          <div className="animate-blob delay-500 absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="bg-grid absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-[1440px] gap-8 px-4 py-8 sm:px-8 lg:px-10 lg:min-h-[calc(100vh-61px)] lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-10">
          <div>
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Empowering Careers. Building Futures.
            </div>

            <h1 className="animate-fade-in-up delay-100 mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-[3.4rem]">
              Connecting Students <br className="hidden md:block" />
              to Careers, <span className="text-emerald-600">Empowering Futures</span>
            </h1>

            <p className="animate-fade-in-up delay-200 mt-4 max-w-lg text-base text-slate-500 md:text-lg">
              Campus Bridge 360 is a unified placement &amp; career management platform that
              bridges the gap between students and opportunities. For students to grow. For TPOs
              to run every drive, track every outcome, and place every eligible student — without
              the spreadsheets.
            </p>

            <div className="animate-fade-in-up delay-300 mt-6 flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group w-full shadow-lg shadow-teal-600/25 transition-transform hover:-translate-y-0.5 sm:w-auto"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login?role=tpo">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full transition-transform hover:-translate-y-0.5 sm:w-auto"
                >
                  <Building2 className="h-5 w-5" />
                  TPO Sign In
                </Button>
              </Link>
            </div>

            <div className="animate-fade-in-up delay-500 mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold tabular-nums text-slate-900">
                      <StatValue value={stat.value} />
                    </p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard mockup carousel */}
          <div className="animate-fade-in-up delay-300">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-24 pt-8 sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/20 blur-3xl" />
        </div>

        <div className="mb-12 text-center">
          <div className="animate-fade-in-up mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Features
          </div>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Smarter Placements
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Powerful features designed to simplify placement management and enhance student
            success.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-fade-in-up group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
            >
              <div className={`absolute inset-x-0 top-0 h-[3px] scale-x-0 ${feature.bar} transition-transform duration-300 group-hover:scale-x-100`} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute right-5 top-5 text-xs font-semibold text-slate-200 transition-colors duration-300 group-hover:text-slate-300">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div
                className={`relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="relative text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="relative mt-2 text-sm text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-24 sm:px-8 lg:px-10">
        <div className="mb-14 text-center">
          <div className="animate-fade-in-up mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            How it works
          </div>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            From sign-up to{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              signed offer
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Four steps stand between where students are now and where they want to be — and TPOs
            see every one of them happen.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step, i) => (
            <div
              key={step.title}
              style={{ animationDelay: `${i * 100}ms` }}
              className="animate-fade-in-up relative flex flex-col items-center text-center"
            >
              {i < howItWorks.length - 1 && (
                <div className="absolute left-1/2 top-7 hidden h-px w-full bg-gradient-to-r from-slate-200 to-transparent lg:block" />
              )}
              <div className="relative flex flex-col items-center">
                <div
                  className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl ${step.color} shadow-sm`}
                >
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 max-w-[240px] text-sm text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#04231b] via-[#065f46] to-[#0d9488] shadow-2xl shadow-emerald-950/40">
          {/* Top accent strip */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300" />

          {/* Ambient glow orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="animate-blob absolute -right-16 -top-20 h-80 w-80 rounded-full bg-emerald-400/25 blur-3xl" />
            <div className="animate-blob delay-300 absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
            <div className="animate-blob delay-500 absolute -left-10 top-1/3 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
          </div>
          {/* Fine dot grid, fading toward the bottom-right */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15] [mask-image:radial-gradient(ellipse_70%_70%_at_15%_20%,black,transparent)]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          {/* Diagonal light sheen */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.02) 55%, transparent 65%)",
            }}
          />
          {/* Orbit rings with a glowing hub and radiating connector ticks — gives the
              floating stat cards something to visually "orbit" instead of sitting
              on bare circles. */}
          <svg
            className="pointer-events-none absolute right-6 top-1/2 hidden h-[340px] w-[340px] -translate-y-1/2 text-white/10 lg:block"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="74" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="52" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" />
            {/* Connector ticks + nodes, one per floating card, radiating outward */}
            <g stroke="currentColor" strokeWidth="1">
              <line x1="100" y1="100" x2="100" y2="4" />
              <line x1="100" y1="100" x2="196" y2="100" />
              <line x1="100" y1="100" x2="169" y2="169" />
              <line x1="100" y1="100" x2="31" y2="169" />
            </g>
            <circle cx="100" cy="4" r="3" className="animate-pulse" fill="#5eead4" stroke="none" />
            <circle cx="196" cy="100" r="3" className="animate-pulse" fill="#5eead4" stroke="none" />
            <circle cx="169" cy="169" r="3" className="animate-pulse" fill="#fcd34d" stroke="none" />
            <circle cx="31" cy="169" r="3" className="animate-pulse" fill="#6ee7b7" stroke="none" />
          </svg>
          {/* Glowing hub at the orbit's center */}
          <div className="pointer-events-none absolute right-[176px] top-1/2 hidden h-4 w-4 -translate-y-1/2 items-center justify-center lg:flex">
            <div className="absolute h-full w-full animate-pulse rounded-full bg-emerald-300/60 blur-md" />
            <div className="relative h-2 w-2 rounded-full bg-emerald-200" />
          </div>

          {/* Placement stats, spread around — clear of the hub and well above the wave divider */}
          <div className="animate-float-slow pointer-events-none absolute right-16 top-6 z-10 hidden items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 shadow-lg shadow-black/20 backdrop-blur-md lg:flex">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
            <div>
              <p className="text-xs font-medium text-white">Offer accepted</p>
              <p className="text-[10px] text-teal-100/70">TCS · Software Engineer</p>
            </div>
          </div>

          <div className="animate-float-slow delay-500 pointer-events-none absolute right-2 top-[38%] z-10 hidden items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 shadow-lg shadow-black/20 backdrop-blur-md lg:flex">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-teal-200" />
            <p className="text-xs font-medium text-white">500+ companies hiring</p>
          </div>

          <div className="animate-float-slow delay-300 pointer-events-none absolute bottom-28 right-8 z-10 hidden items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 shadow-lg shadow-black/20 backdrop-blur-md lg:flex">
            <TrendingUp className="h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="text-xs font-medium text-white">95% placement rate</p>
              <p className="text-[10px] text-teal-100/70">Across partner companies</p>
            </div>
          </div>

          <div className="animate-float-slow delay-100 pointer-events-none absolute bottom-32 right-56 z-10 hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 shadow-lg shadow-black/20 backdrop-blur-md xl:flex">
            <Users className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
            <p className="text-xs font-medium text-white">10K+ students placed</p>
          </div>

          <div className="relative px-8 py-14 md:px-14 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Always free for students · Trusted by placement cells
            </div>

            <h3 className="mt-5 max-w-xl text-3xl font-bold leading-[1.15] tracking-tight text-white md:text-5xl">
              Your placement journey deserves better than{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                spreadsheets and guesswork.
              </span>
            </h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-teal-100/90 md:text-base">
              From your first eligible job to your final offer letter — Campus Bridge 360 keeps
              students and placement cells moving in sync, every step of the way.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group w-full bg-white text-teal-700 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl sm:w-auto"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login?role=tpo">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/25 bg-white/5 text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/15 hover:text-white sm:w-auto"
                >
                  <Building2 className="h-4 w-4" />
                  I&apos;m a TPO
                </Button>
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-teal-100/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> No credit card, ever
              </span>
              <span className="hidden h-3.5 w-px bg-teal-100/25 sm:block" />
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Live in minutes, not weeks
              </span>
            </div>
          </div>

          {/* Wave divider — fades from the card's green into the page background */}
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full md:h-24"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="ctaWaveFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#5eead4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f8fafc" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M0,55 C300,105 900,5 1200,55 L1200,100 L0,100 Z" fill="url(#ctaWaveFade)" />
          </svg>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-400">
        Campus Bridge 360 — College Placement and Career Management Platform
      </footer>
    </div>
  );
}
