import Link from "next/link";
import { ArrowLeft, Briefcase, Building2, GraduationCap, LineChart, ShieldCheck, Sparkles, Users } from "lucide-react";

type AuthVariant = "student" | "tpo";

const copy: Record<
  AuthVariant,
  {
    badge: string;
    heading: string;
    highlightedWord: string;
    body: string;
    highlights: { icon: React.ComponentType<{ className?: string }>; text: string }[];
  }
> = {
  student: {
    badge: "Connecting Students to Careers",
    heading: "Your placement journey starts",
    highlightedWord: "here.",
    body: "Discover opportunities, apply with confidence and build your future with the right connections.",
    highlights: [
      { icon: Briefcase, text: "Find jobs you're eligible for" },
      { icon: LineChart, text: "Track applications in one place" },
      { icon: Sparkles, text: "Get real-time updates" },
      { icon: Users, text: "Connect with alumni & mentors" },
    ],
  },
  tpo: {
    badge: "Command Center for Placement Cells",
    heading: "Run every drive with total",
    highlightedWord: "visibility.",
    body: "Manage companies, drives, applications and analytics from a single, centralized console.",
    highlights: [
      { icon: Building2, text: "Coordinate companies and drives end-to-end" },
      { icon: Users, text: "Track every student and application" },
      { icon: LineChart, text: "Real-time placement analytics" },
      { icon: ShieldCheck, text: "Role-based, server-verified access" },
    ],
  },
};

export function AuthShell({
  children,
  variant = "student",
}: {
  children: React.ReactNode;
  variant?: AuthVariant;
}) {
  const v = copy[variant];

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] lg:flex">
      {/* Left section — campus photo with legibility overlay (desktop only) */}
      <div className="relative hidden min-h-screen lg:block lg:w-[66%]">
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: "url(/campus-photo.png)", backgroundPosition: "center center" }}
        />
        {/* Left-to-right white wash so the photo stays bright while text stays legible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.96) 18%, rgba(255,255,255,0.88) 32%, rgba(255,255,255,0.65) 46%, rgba(255,255,255,0.30) 62%, rgba(255,255,255,0.05) 82%, rgba(255,255,255,0) 100%)",
          }}
        />
        {/* Soft bottom blend into the page background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(0deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 35%)",
          }}
        />

        <div className="relative z-10 flex min-h-screen flex-col justify-between py-[55px] pl-[76px] pr-12">
          <Link href="/" className="group flex w-fit items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white transition-transform group-hover:-translate-x-0.5">
              CB
            </div>
            <span className="text-lg font-bold text-[#0F172A]">
              Campus Bridge <span className="text-emerald-600">360</span>
            </span>
          </Link>

          <div key={variant} className="max-w-xl">
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-600">
              <Sparkles className="h-3.5 w-3.5" />
              {v.badge}
            </div>
            <h1 className="animate-fade-in-up delay-100 mt-8 text-[52px] font-extrabold leading-[1.08] tracking-tight text-[#0F172A] xl:text-[58px]">
              {v.heading} <span className="text-emerald-600">{v.highlightedWord}</span>
            </h1>
            <p className="animate-fade-in-up delay-200 mt-[22px] max-w-[500px] text-lg leading-[1.5] text-[#475569]">
              {v.body}
            </p>

            <div className="mt-10 space-y-4">
              {v.highlights.map((h, i) => (
                <div
                  key={h.text}
                  className={`animate-fade-in-up flex items-center gap-3 ${
                    ["delay-100", "delay-200", "delay-300", "delay-500"][i]
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <h.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-[#0F172A]">{h.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex max-w-[760px] items-center gap-3 rounded-[18px] border p-4"
            style={{
              background: "rgba(255,255,255,0.75)",
              borderColor: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            }}
          >
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">Secure. Reliable. Built for your success.</p>
              <p className="text-xs text-[#64748B]">Your data is safe with us.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right section — floating login card */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:w-[34%] lg:px-10">
        <div className="w-full max-w-[520px]">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
