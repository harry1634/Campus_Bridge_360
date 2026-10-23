import { z } from "zod";
import { DEPARTMENTS, normalizeDepartment } from "@/lib/constants";

export const studentAcademicRowSchema = z.object({
  studentId: z.coerce.string().trim().min(1, "Student ID is required"),
  name: z.string().trim().min(1, "Name is required"),
  department: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const normalized = normalizeDepartment(v);
      if (!normalized) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Department must be one of: ${DEPARTMENTS.join(", ")}`,
        });
        return z.NEVER;
      }
      return normalized;
    }),
  batch: z.string().trim().min(1, "Batch is required"),
  cgpa: z.coerce.number().min(0, "CGPA must be >= 0").max(10, "CGPA must be <= 10"),
  backlogs: z.coerce.number().int().min(0, "Backlogs must be a non-negative integer"),
});
export type StudentAcademicRowInput = z.infer<typeof studentAcademicRowSchema>;

export interface ParsedRow {
  rowIndex: number;
  raw: Record<string, unknown>;
  valid: boolean;
  data?: StudentAcademicRowInput;
  errors: string[];
}

const COLUMN_ALIASES: Record<string, string> = {
  "student id": "studentId",
  studentid: "studentId",
  name: "name",
  department: "department",
  batch: "batch",
  cgpa: "cgpa",
  backlogs: "backlogs",
};

function normalizeKey(key: string): string {
  return COLUMN_ALIASES[key.trim().toLowerCase()] ?? key;
}

export function normalizeRow(raw: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    normalized[normalizeKey(key)] = value;
  }
  return normalized;
}

export function validateRows(rawRows: Record<string, unknown>[]): ParsedRow[] {
  return rawRows.map((raw, i) => {
    const normalized = normalizeRow(raw);
    const parsed = studentAcademicRowSchema.safeParse(normalized);
    if (parsed.success) {
      return { rowIndex: i + 2, raw, valid: true, data: parsed.data, errors: [] };
    }
    return {
      rowIndex: i + 2,
      raw,
      valid: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
  });
}
