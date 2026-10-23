import type { StudentProfile } from "@/lib/types";

interface CompletionField {
  label: string;
  complete: boolean;
}

export interface ProfileCompletionResult {
  percentage: number;
  missingFields: string[];
}

export function computeProfileCompletion(student: StudentProfile): ProfileCompletionResult {
  const fields: CompletionField[] = [
    { label: "Phone number", complete: !!student.phone },
    { label: "Profile photo", complete: !!student.photoUrl },
    { label: "CGPA", complete: student.cgpa > 0 },
    { label: "Skills", complete: student.skills.length > 0 },
    { label: "Projects", complete: student.projects.length > 0 },
    { label: "Resume", complete: !!student.resumeUrl },
    { label: "LinkedIn profile", complete: !!student.linkedin },
    { label: "GitHub profile", complete: !!student.github },
    { label: "Preferred job role", complete: !!student.preferredRole },
    { label: "Preferred industry", complete: !!student.preferredIndustry },
    { label: "Preferred location", complete: !!student.preferredLocation },
  ];

  const completedCount = fields.filter((f) => f.complete).length;
  const percentage = Math.round((completedCount / fields.length) * 100);
  const missingFields = fields.filter((f) => !f.complete).map((f) => f.label);

  return { percentage, missingFields };
}
