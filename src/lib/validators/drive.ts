import { z } from "zod";
import { normalizeDepartment } from "@/lib/constants";

export const driveFormSchema = z.object({
  companyId: z.string().min(1, "Select a company"),
  jobRole: z.string().min(2, "Job role is required"),
  package: z.string().min(1, "Package is required"),
  driveDate: z.string().min(1, "Drive date is required"),
  location: z.string().min(1, "Location is required"),
  workMode: z.enum(["onsite", "remote", "hybrid"]),
  applicationDeadline: z.string().min(1, "Deadline is required"),
  description: z.string().min(10, "Add a short description"),
  recruitmentStages: z.string().min(1, "List at least one stage"),
  departments: z.string().min(1, "Enter at least one department"),
  batches: z.string(),
  minCgpa: z.string(),
  maxBacklogs: z.string(),
});
export type DriveFormInput = z.infer<typeof driveFormSchema>;

export const drivePayloadSchema = z.object({
  companyId: z.string().min(1),
  jobRole: z.string().min(2),
  package: z.string().min(1),
  driveDate: z.string().min(1),
  location: z.string().min(1),
  workMode: z.enum(["onsite", "remote", "hybrid"]),
  applicationDeadline: z.string().min(1),
  description: z.string().min(10),
  recruitmentStages: z.array(z.string()),
  departments: z.array(z.string()).min(1),
  batches: z.array(z.string()),
  minCgpa: z.coerce.number().min(0).max(10),
  maxBacklogs: z.coerce.number().min(0),
});
export type DriveInput = z.infer<typeof drivePayloadSchema>;

function parseCsv(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export function driveFormToPayload(form: DriveFormInput): DriveInput {
  return {
    ...form,
    recruitmentStages: parseCsv(form.recruitmentStages),
    departments: parseCsv(form.departments).map((d) => normalizeDepartment(d) ?? d),
    batches: parseCsv(form.batches),
    minCgpa: Number(form.minCgpa || 0),
    maxBacklogs: Number(form.maxBacklogs || 0),
  };
}

// Reverse of driveFormToPayload — used to pre-fill the edit form from a
// stored drive record.
export function driveToFormInput(drive: {
  companyId: string;
  jobRole: string;
  package: string;
  driveDate: string;
  location: string;
  workMode: "onsite" | "remote" | "hybrid";
  applicationDeadline: string;
  description: string;
  recruitmentStages: string[];
  eligibility: { departments: string[]; minCgpa: number; maxBacklogs: number; batches: string[] };
}): DriveFormInput {
  return {
    companyId: drive.companyId,
    jobRole: drive.jobRole,
    package: drive.package,
    driveDate: drive.driveDate,
    location: drive.location,
    workMode: drive.workMode,
    applicationDeadline: drive.applicationDeadline,
    description: drive.description,
    recruitmentStages: drive.recruitmentStages.join(", "),
    departments: drive.eligibility.departments.join(", "),
    batches: drive.eligibility.batches.join(", "),
    minCgpa: String(drive.eligibility.minCgpa),
    maxBacklogs: String(drive.eligibility.maxBacklogs),
  };
}
