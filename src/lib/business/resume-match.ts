import type { Job, ResumeMatchResult } from "@/lib/types";
import { matchSkills } from "./skill-match";

/**
 * Rule-based resume/JD comparison. Compares the student's declared profile
 * skills (not the raw resume file — parsing arbitrary PDFs reliably is out
 * of scope) against the job's required + preferred skills.
 */
export function matchResumeToJob(studentSkills: string[], job: Job): ResumeMatchResult {
  const required = matchSkills(studentSkills, job.requiredSkills);
  const preferred = matchSkills(studentSkills, job.preferredSkills);

  const suggestions: string[] = [];
  for (const skill of required.missing) {
    suggestions.push(
      `Add ${skill} experience if you genuinely have it — it's a required skill for this role.`
    );
  }
  for (const skill of preferred.missing) {
    suggestions.push(`Mention ${skill} experience if applicable — it's preferred for this role.`);
  }
  if (required.matched.length > 0) {
    suggestions.push(
      `Highlight your ${required.matched.join(", ")} experience prominently in relevant projects.`
    );
  }
  suggestions.push(
    "These suggestions are based on keyword/skill matching against your profile — they do not fabricate experience."
  );

  return {
    jobId: job.id,
    matchedSkills: [...required.matched, ...preferred.matched],
    missingSkills: [...required.missing, ...preferred.missing],
    relevantSkills: studentSkills,
    suggestions,
  };
}
