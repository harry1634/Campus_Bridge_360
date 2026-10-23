import type { Job, StudentProfile, JobMatch } from "@/lib/types";
import { matchSkills } from "./skill-match";
import { evaluateEligibility } from "./eligibility";

/**
 * Rule-based job recommendation engine (no AI). Match score weighting:
 *   - 60% required skills overlap
 *   - 20% preferred skills overlap
 *   - 10% career preference (role/industry) match
 *   - 10% eligibility (department/CGPA/backlogs/batch all satisfied)
 */
export function scoreJobForStudent(student: StudentProfile, job: Job): JobMatch {
  const required = matchSkills(student.skills, job.requiredSkills);
  const preferred = matchSkills(student.skills, job.preferredSkills);

  const requiredScore =
    job.requiredSkills.length === 0 ? 1 : required.matched.length / job.requiredSkills.length;
  const preferredScore =
    job.preferredSkills.length === 0 ? 1 : preferred.matched.length / job.preferredSkills.length;

  const preferenceMatch =
    student.preferredRole &&
    job.title.toLowerCase().includes(student.preferredRole.toLowerCase())
      ? 1
      : 0;

  const eligibility = evaluateEligibility(student, job.eligibility);
  const eligibilityScore = eligibility.eligible ? 1 : 0;

  const rawScore =
    requiredScore * 0.6 + preferredScore * 0.2 + preferenceMatch * 0.1 + eligibilityScore * 0.1;
  const matchScore = Math.round(rawScore * 100);

  const totalMajorSkills = job.requiredSkills.length;
  const matchedMajorSkills = required.matched.length;

  return {
    jobId: job.id,
    jobTitle: job.title,
    companyName: job.companyName,
    matchScore,
    matchedSkills: [...required.matched, ...preferred.matched],
    missingSkills: [...required.missing, ...preferred.missing],
    reason:
      totalMajorSkills > 0
        ? `${matchedMajorSkills} of ${totalMajorSkills} required skills match.`
        : "No specific skills required for this role.",
  };
}

export function recommendJobs(student: StudentProfile, jobs: Job[], limit = 10): JobMatch[] {
  return jobs
    .map((job) => scoreJobForStudent(student, job))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
