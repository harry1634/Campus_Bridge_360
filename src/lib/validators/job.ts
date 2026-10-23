import { z } from "zod";
import { normalizeDepartment } from "@/lib/constants";

const workModeEnum = z.enum(["onsite", "remote", "hybrid"]);
const jobTypeEnum = z.enum(["full-time", "internship", "internship-ppo", "contract"]);

// Shape used by the React Hook Form <form> — every field is a plain string,
// since HTML inputs only ever produce strings.
export const jobFormSchema = z.object({
  companyId: z.string().min(1, "Select a company"),
  title: z.string().min(2, "Job title is required"),
  description: z.string().min(10, "Add a short job description"),
  location: z.string().min(1, "Location is required"),
  workMode: workModeEnum,
  package: z.string().min(1, "Package is required"),
  jobType: jobTypeEnum,
  requiredSkills: z.string(),
  preferredSkills: z.string(),
  applicationDeadline: z.string().min(1, "Deadline is required"),
  driveDate: z.string().optional(),
  departments: z.string().min(1, "Enter at least one department"),
  minCgpa: z.string(),
  maxBacklogs: z.string(),
  batches: z.string(),
  otherRequirements: z.string().optional(),
});
export type JobFormInput = z.infer<typeof jobFormSchema>;

// Shape sent to the API / stored in Firestore — csv fields parsed to arrays.
export const jobPayloadSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().min(10),
  location: z.string().min(1),
  workMode: workModeEnum,
  package: z.string().min(1),
  jobType: jobTypeEnum,
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  applicationDeadline: z.string().min(1),
  driveDate: z.string().optional(),
  departments: z.array(z.string()).min(1),
  minCgpa: z.coerce.number().min(0).max(10),
  maxBacklogs: z.coerce.number().min(0),
  batches: z.array(z.string()),
  otherRequirements: z.string().optional(),
});
export type JobInput = z.infer<typeof jobPayloadSchema>;

export function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function jobFormToPayload(form: JobFormInput): JobInput {
  return {
    ...form,
    requiredSkills: parseCsv(form.requiredSkills),
    preferredSkills: parseCsv(form.preferredSkills),
    departments: parseCsv(form.departments).map((d) => normalizeDepartment(d) ?? d),
    batches: parseCsv(form.batches),
    minCgpa: Number(form.minCgpa || 0),
    maxBacklogs: Number(form.maxBacklogs || 0),
  };
}

// Reverse of jobFormToPayload — used to pre-fill the edit form from a stored
// job record.
export function jobToFormInput(job: {
  companyId: string;
  title: string;
  description: string;
  location: string;
  workMode: "onsite" | "remote" | "hybrid";
  package: string;
  jobType: "full-time" | "internship" | "internship-ppo" | "contract";
  requiredSkills: string[];
  preferredSkills: string[];
  applicationDeadline: string;
  driveDate?: string;
  eligibility: {
    departments: string[];
    minCgpa: number;
    maxBacklogs: number;
    batches: string[];
    otherRequirements?: string;
  };
}): JobFormInput {
  return {
    companyId: job.companyId,
    title: job.title,
    description: job.description,
    location: job.location,
    workMode: job.workMode,
    package: job.package,
    jobType: job.jobType,
    requiredSkills: job.requiredSkills.join(", "),
    preferredSkills: job.preferredSkills.join(", "),
    applicationDeadline: job.applicationDeadline,
    driveDate: job.driveDate ?? "",
    departments: job.eligibility.departments.join(", "),
    minCgpa: String(job.eligibility.minCgpa),
    maxBacklogs: String(job.eligibility.maxBacklogs),
    batches: job.eligibility.batches.join(", "),
    otherRequirements: job.eligibility.otherRequirements ?? "",
  };
}
