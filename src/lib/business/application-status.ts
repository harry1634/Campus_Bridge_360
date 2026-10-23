import type { ApplicationStatus } from "@/lib/types";

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "applied",
  "shortlisted",
  "assessment",
  "technical_interview",
  "hr_interview",
  "selected",
  "rejected",
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  assessment: "Assessment",
  technical_interview: "Technical Interview",
  hr_interview: "HR Interview",
  selected: "Selected",
  rejected: "Rejected",
};

export const APPLICATION_STATUS_BADGE: Record<ApplicationStatus, "default" | "success" | "warning" | "destructive" | "purple"> = {
  applied: "warning",
  shortlisted: "default",
  assessment: "purple",
  technical_interview: "purple",
  hr_interview: "purple",
  selected: "success",
  rejected: "destructive",
};
