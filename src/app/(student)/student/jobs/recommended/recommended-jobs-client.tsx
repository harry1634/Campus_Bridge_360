"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { JobMatch } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Sparkles } from "lucide-react";

export function RecommendedJobsClient({
  matches,
  appliedJobIds,
}: {
  matches: JobMatch[];
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

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No recommendations yet"
        description="Add skills, projects and career preferences to your profile to get personalized job matches."
      />
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {matches.map((match) => {
          const isApplied = applied.has(match.jobId);
          return (
            <Card key={match.jobId} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-sm font-bold text-purple-600">
                    {match.companyName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{match.jobTitle}</p>
                    <p className="text-xs text-slate-500">{match.companyName}</p>
                  </div>
                </div>

                <Badge
                  variant={match.matchScore >= 70 ? "success" : match.matchScore >= 40 ? "warning" : "outline"}
                  className="mt-3"
                >
                  Match Score: {match.matchScore}%
                </Badge>

                {match.matchedSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-600">Matched</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {match.matchedSkills.map((s) => (
                        <span key={s} className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {match.missingSkills.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-slate-600">Missing</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {match.missingSkills.map((s) => (
                        <span key={s} className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] text-red-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-3 text-xs text-slate-500">{match.reason}</p>

                <Button
                  className="mt-4 w-full"
                  disabled={isApplied || applying === match.jobId}
                  onClick={() => handleApply(match.jobId)}
                >
                  {isApplied ? "Applied" : applying === match.jobId ? "Applying..." : "Apply Now"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
