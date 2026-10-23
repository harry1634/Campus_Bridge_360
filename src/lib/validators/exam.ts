import { z } from "zod";
import { normalizeDepartment } from "@/lib/constants";

export const examFormSchema = z.object({
  name: z.string().min(2, "Exam name is required"),
  companyId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  durationMinutes: z.string().min(1, "Duration is required"),
  examType: z.enum(["aptitude", "coding", "technical", "communication", "other"]),
  platform: z.string().optional(),
  examLink: z.string().optional(),
  instructions: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  departments: z.string().min(1, "Enter at least one department"),
  batches: z.string(),
  minCgpa: z.string(),
  maxBacklogs: z.string(),
});
export type ExamFormInput = z.infer<typeof examFormSchema>;

export const examPayloadSchema = z.object({
  name: z.string().min(2),
  companyId: z.string().optional(),
  date: z.string().min(1),
  time: z.string().min(1),
  durationMinutes: z.coerce.number().min(1),
  examType: z.enum(["aptitude", "coding", "technical", "communication", "other"]),
  platform: z.string().optional(),
  examLink: z.string().optional(),
  instructions: z.string().optional(),
  deadline: z.string().min(1),
  departments: z.array(z.string()).min(1),
  batches: z.array(z.string()),
  minCgpa: z.coerce.number().min(0).max(10),
  maxBacklogs: z.coerce.number().min(0),
});
export type ExamInput = z.infer<typeof examPayloadSchema>;

function parseCsv(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export function examFormToPayload(form: ExamFormInput): ExamInput {
  return {
    ...form,
    departments: parseCsv(form.departments).map((d) => normalizeDepartment(d) ?? d),
    batches: parseCsv(form.batches),
    minCgpa: Number(form.minCgpa || 0),
    maxBacklogs: Number(form.maxBacklogs || 0),
    durationMinutes: Number(form.durationMinutes || 0),
  };
}

// Reverse of examFormToPayload — used to pre-fill the edit form from a
// stored exam record.
export function examToFormInput(exam: {
  name: string;
  companyId?: string | null;
  date: string;
  time: string;
  durationMinutes: number;
  examType: "aptitude" | "coding" | "technical" | "communication" | "other";
  platform?: string | null;
  examLink?: string | null;
  instructions?: string | null;
  deadline: string;
  eligibility: { departments: string[]; minCgpa: number; maxBacklogs: number; batches: string[] };
}): ExamFormInput {
  return {
    name: exam.name,
    companyId: exam.companyId ?? "",
    date: exam.date,
    time: exam.time,
    durationMinutes: String(exam.durationMinutes),
    examType: exam.examType,
    platform: exam.platform ?? "",
    examLink: exam.examLink ?? "",
    instructions: exam.instructions ?? "",
    deadline: exam.deadline,
    departments: exam.eligibility.departments.join(", "),
    batches: exam.eligibility.batches.join(", "),
    minCgpa: String(exam.eligibility.minCgpa),
    maxBacklogs: String(exam.eligibility.maxBacklogs),
  };
}
