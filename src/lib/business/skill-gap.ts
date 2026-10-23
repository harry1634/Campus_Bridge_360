import type { StudentProfile, Job, SkillGapResult } from "@/lib/types";
import { normalizeSkill } from "./skill-match";

/**
 * Rule-based skill gap analysis: for every skill required across the given
 * jobs, computes what percentage of the given students are missing it.
 */
export function computeSkillGaps(students: StudentProfile[], jobs: Job[]): SkillGapResult[] {
  const skillCounts = new Map<string, { display: string; having: number }>();

  const allRequiredSkills = new Set<string>();
  for (const job of jobs) {
    for (const skill of job.requiredSkills) {
      const key = normalizeSkill(skill);
      if (!allRequiredSkills.has(key)) {
        allRequiredSkills.add(key);
        skillCounts.set(key, { display: skill, having: 0 });
      }
    }
  }

  const total = students.length;
  if (total === 0) return [];

  for (const student of students) {
    const studentSkillSet = new Set(student.skills.map(normalizeSkill));
    for (const key of allRequiredSkills) {
      if (studentSkillSet.has(key)) {
        skillCounts.get(key)!.having += 1;
      }
    }
  }

  const results: SkillGapResult[] = [];
  for (const [, { display, having }] of skillCounts) {
    const gapPercentage = Math.round(((total - having) / total) * 100);
    results.push({
      skill: display,
      gapPercentage,
      studentsHaving: having,
      studentsTotal: total,
    });
  }

  return results.sort((a, b) => b.gapPercentage - a.gapPercentage);
}
