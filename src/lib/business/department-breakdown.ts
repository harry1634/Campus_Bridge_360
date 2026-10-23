import type { Application, EligibilityCriteria, StudentProfile } from "@/lib/types";
import { evaluateEligibility } from "./eligibility";

export interface DepartmentStats {
  department: string;
  eligible: number;
  applied: number;
  shortlisted: number;
  selected: number;
}

const SHORTLISTED_OR_LATER = new Set([
  "shortlisted",
  "assessment",
  "technical_interview",
  "hr_interview",
  "selected",
]);

export function computeDepartmentBreakdown(
  students: StudentProfile[],
  applications: Application[],
  eligibility: EligibilityCriteria
): DepartmentStats[] {
  const departments =
    eligibility.departments.length > 0
      ? eligibility.departments
      : Array.from(new Set(students.map((s) => s.department)));

  return departments.map((department) => {
    const deptStudents = students.filter((s) => s.department === department);
    const eligibleCount = deptStudents.filter(
      (s) => evaluateEligibility(s, eligibility).eligible
    ).length;
    const deptApplications = applications.filter((a) => a.department === department);

    return {
      department,
      eligible: eligibleCount,
      applied: deptApplications.length,
      shortlisted: deptApplications.filter((a) => SHORTLISTED_OR_LATER.has(a.status)).length,
      selected: deptApplications.filter((a) => a.status === "selected").length,
    };
  });
}
