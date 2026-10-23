"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowRight, Bookmark, CheckCircle2, Sparkles, Briefcase } from "lucide-react";

export interface DashboardJobMatch {
  jobId: string;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  location: string;
  package: string;
  skills: string[];
  eligible: boolean;
  cgpaOk: boolean;
  backlogsOk: boolean;
}

function initialFor(name: string) {
  return name.charAt(0).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-teal-50 text-teal-600",
  "bg-indigo-50 text-indigo-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
];

export function RecommendedJobsWidget({
  jobs,
  appliedJobIds,
}: {
  jobs: DashboardJobMatch[];
  appliedJobIds: string[];
}) {
  const router = useRouter();
  const [applying, setApplying] = React.useState<string | null>(null);
  const [applied, setApplied] = React.useState<Set<string>>(new Set(appliedJobIds));
  const [error, setError] = React.useState<string | null>(null);

  async function handleApply(jobId: string) {
    setApplying(jobId);
    setError(null);
    try {
      const res = await fetch("/api/student/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to apply");
        return;
      }
      setApplied((prev) => new Set(prev).add(jobId));
      router.refresh();
    } finally {
      setApplying(null);
    }
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No recommendations yet"
        description="Add skills and career preferences to your profile to get personalized job matches."
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job, i) => {
          const isApplied = applied.has(job.jobId);
          const tier =
            job.matchScore >= 85
              ? { bar: "from-emerald-500 to-teal-500", text: "text-emerald-700", bg: "bg-emerald-50", fill: "bg-emerald-500" }
              : job.matchScore >= 70
                ? { bar: "from-teal-500 to-indigo-500", text: "text-teal-700", bg: "bg-teal-50", fill: "bg-teal-500" }
                : { bar: "from-amber-500 to-orange-500", text: "text-amber-700", bg: "bg-amber-50", fill: "bg-amber-500" };

          return (
            <Card
              key={job.jobId}
              className={`animate-fade-in-up group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                ["delay-100", "delay-200", "delay-300"][i % 3]
              }`}
            >
              <div className={`h-1 w-full bg-gradient-to-r ${tier.bar}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold ring-1 ring-black/5 transition-transform group-hover:scale-105 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                    >
                      {initialFor(job.companyName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{job.jobTitle}</p>
                      <p className="text-xs text-slate-500">{job.companyName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Save job"
                    className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-50 hover:text-teal-600"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3.5 flex items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tier.bg} ${tier.text}`}>
                    <Sparkles className="h-3 w-3" />
                    {job.matchScore}% Match
                  </span>
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                    <div className={`h-1.5 rounded-full ${tier.fill}`} style={{ width: `${job.matchScore}%` }} />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{job.location}</span>
                  <span className="font-medium text-slate-700">{job.package}</span>
                </div>
                {job.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.skills.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${job.eligible ? "text-emerald-500" : "text-slate-300"}`} />
                    {job.eligible ? "Eligible" : "Not currently eligible"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${job.cgpaOk ? "text-emerald-500" : "text-slate-300"}`} />
                    {job.cgpaOk ? "CGPA criteria met" : "CGPA below requirement"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${job.backlogsOk ? "text-emerald-500" : "text-slate-300"}`} />
                    {job.backlogsOk ? "Backlog criteria met" : "Too many backlogs"}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="group/apply mt-4 w-full shadow-md shadow-teal-600/20"
                  disabled={!job.eligible || isApplied || applying === job.jobId}
                  onClick={() => handleApply(job.jobId)}
                >
                  {isApplied ? "Applied" : applying === job.jobId ? "Applying..." : "Apply Now"}
                  {!isApplied && applying !== job.jobId && (
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/apply:translate-x-1" />
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
