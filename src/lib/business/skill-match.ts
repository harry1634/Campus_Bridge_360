/** Normalizes a skill string for case/whitespace-insensitive comparison. */
export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

export function matchSkills(
  studentSkills: string[],
  requiredSkills: string[]
): { matched: string[]; missing: string[] } {
  const normalizedStudentSkills = new Set(studentSkills.map(normalizeSkill));
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of requiredSkills) {
    if (normalizedStudentSkills.has(normalizeSkill(skill))) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  return { matched, missing };
}
