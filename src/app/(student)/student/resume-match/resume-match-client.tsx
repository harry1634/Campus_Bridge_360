"use client";

import * as React from "react";
import type { Job } from "@/lib/types";
import { matchResumeToJob } from "@/lib/business/resume-match";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckCircle2, FileText, XCircle } from "lucide-react";

export function ResumeMatchClient({ jobs, studentSkills }: { jobs: Job[]; studentSkills: string[] }) {
  const [selectedJobId, setSelectedJobId] = React.useState(jobs[0]?.id ?? "");
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const result = selectedJob ? matchResumeToJob(studentSkills, selectedJob) : null;

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No published jobs to compare against"
        description="Once jobs are published, you can compare your profile skills against their requirements here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {studentSkills.length === 0 && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Add skills to your profile first for an accurate comparison.
        </div>
      )}

      <Card>
        <CardContent className="p-5">
          <label className="text-sm font-medium text-slate-700">Select a job to compare against</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} · {job.companyName}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {result && selectedJob && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-slate-900">
              {selectedJob.title} at {selectedJob.companyName}
            </p>
            <p className="mt-1 text-xs text-slate-500">Job requirements comparison</p>

            <div className="mt-4 space-y-2">
              {[...selectedJob.requiredSkills, ...selectedJob.preferredSkills].map((skill) => {
                const matched = result.matchedSkills.includes(skill);
                return (
                  <div key={skill} className="flex items-center gap-2 text-sm">
                    {matched ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={matched ? "text-slate-900" : "text-slate-500"}>{skill}</span>
                    {selectedJob.requiredSkills.includes(skill) && (
                      <Badge variant="outline" className="ml-auto">
                        Required
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Suggestions
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-slate-400">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
