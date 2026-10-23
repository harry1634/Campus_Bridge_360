import type { EligibilityCriteria, StudentProfile } from "@/lib/types";

export interface EligibilityCheck {
  key: string;
  label: string;
  passed: boolean;
  reason?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  checks: EligibilityCheck[];
  failureReasons: string[];
}

/**
 * Rule-based eligibility engine. This is the single source of truth for
 * whether a student can apply to a job/drive/exam — it must be called on
 * both the server (to enforce access) and the client (to render the UI).
 */
export function evaluateEligibility(
  student: Pick<StudentProfile, "department" | "cgpa" | "backlogs" | "batch" | "graduationYear">,
  criteria: EligibilityCriteria
): EligibilityResult {
  const checks: EligibilityCheck[] = [];

  const departmentOk =
    criteria.departments.length === 0 || criteria.departments.includes(student.department);
  checks.push({
    key: "department",
    label: "Department",
    passed: departmentOk,
    reason: departmentOk
      ? undefined
      : `Eligible departments: ${criteria.departments.join(", ")}. Your department is ${student.department}.`,
  });

  const cgpaOk = student.cgpa >= criteria.minCgpa;
  checks.push({
    key: "cgpa",
    label: "CGPA",
    passed: cgpaOk,
    reason: cgpaOk
      ? undefined
      : `Minimum CGPA requirement is ${criteria.minCgpa}. Your CGPA is ${student.cgpa}.`,
  });

  const backlogsOk = student.backlogs <= criteria.maxBacklogs;
  checks.push({
    key: "backlogs",
    label: "Backlogs",
    passed: backlogsOk,
    reason: backlogsOk
      ? undefined
      : `Maximum allowed backlogs is ${criteria.maxBacklogs}. You have ${student.backlogs}.`,
  });

  const batchOk = criteria.batches.length === 0 || criteria.batches.includes(student.batch);
  checks.push({
    key: "batch",
    label: "Batch",
    passed: batchOk,
    reason: batchOk
      ? undefined
      : `Eligible batches: ${criteria.batches.join(", ")}. Your batch is ${student.batch}.`,
  });

  if (criteria.graduationYears && criteria.graduationYears.length > 0) {
    const gradYearOk = criteria.graduationYears.includes(student.graduationYear);
    checks.push({
      key: "graduationYear",
      label: "Graduation Year",
      passed: gradYearOk,
      reason: gradYearOk
        ? undefined
        : `Eligible graduation years: ${criteria.graduationYears.join(", ")}. Yours is ${student.graduationYear}.`,
    });
  }

  const failureReasons = checks.filter((c) => !c.passed).map((c) => c.reason!).filter(Boolean);

  return {
    eligible: failureReasons.length === 0,
    checks,
    failureReasons,
  };
}
