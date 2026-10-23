import { z } from "zod";

export const alumniFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  batch: z.string().min(1, "Batch is required"),
  department: z.string().min(1, "Department is required"),
  company: z.string().min(1, "Company is required"),
  designation: z.string().min(1, "Designation is required"),
  industry: z.string().optional(),
  experienceYears: z.string().optional(),
  skills: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  location: z.string().optional(),
  mentorshipAvailable: z.boolean().optional(),
  careerGuidanceAvailable: z.boolean().optional(),
});
export type AlumniFormInput = z.infer<typeof alumniFormSchema>;

export function alumniFormToPayload(form: AlumniFormInput) {
  return {
    ...form,
    experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
    skills: (form.skills ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    mentorshipAvailable: !!form.mentorshipAvailable,
    careerGuidanceAvailable: !!form.careerGuidanceAvailable,
  };
}

// Reverse of alumniFormToPayload — used to pre-fill the edit form from a
// stored alumni record.
export function alumniToFormInput(alumni: {
  name: string;
  batch: string;
  department: string;
  company: string;
  designation: string;
  industry?: string;
  experienceYears?: number;
  skills?: string[];
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  mentorshipAvailable?: boolean;
  careerGuidanceAvailable?: boolean;
}): AlumniFormInput {
  return {
    name: alumni.name,
    batch: alumni.batch,
    department: alumni.department,
    company: alumni.company,
    designation: alumni.designation,
    industry: alumni.industry ?? "",
    experienceYears: alumni.experienceYears != null ? String(alumni.experienceYears) : "",
    skills: (alumni.skills ?? []).join(", "),
    email: alumni.email ?? "",
    phone: alumni.phone ?? "",
    linkedin: alumni.linkedin ?? "",
    location: alumni.location ?? "",
    mentorshipAvailable: !!alumni.mentorshipAvailable,
    careerGuidanceAvailable: !!alumni.careerGuidanceAvailable,
  };
}
