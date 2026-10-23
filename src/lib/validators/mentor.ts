import { z } from "zod";

export const mentorFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().min(1, "Company is required"),
  designation: z.string().min(1, "Designation is required"),
  industry: z.string().optional(),
  experienceYears: z.string().optional(),
  expertise: z.string().min(1, "Enter at least one area of expertise"),
  skills: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  availability: z.string().optional(),
  guidanceAreas: z.string().optional(),
});
export type MentorFormInput = z.infer<typeof mentorFormSchema>;

function parseCsv(value?: string): string[] {
  return (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

export function mentorFormToPayload(form: MentorFormInput) {
  return {
    ...form,
    experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
    expertise: parseCsv(form.expertise),
    skills: parseCsv(form.skills),
    guidanceAreas: parseCsv(form.guidanceAreas),
  };
}

// Reverse of mentorFormToPayload — used to pre-fill the edit form from a
// stored mentor record.
export function mentorToFormInput(mentor: {
  name: string;
  company: string;
  designation: string;
  industry?: string;
  experienceYears?: number;
  expertise: string[];
  skills?: string[];
  email?: string;
  phone?: string;
  linkedin?: string;
  availability?: string;
  guidanceAreas?: string[];
}): MentorFormInput {
  return {
    name: mentor.name,
    company: mentor.company,
    designation: mentor.designation,
    industry: mentor.industry ?? "",
    experienceYears: mentor.experienceYears != null ? String(mentor.experienceYears) : "",
    expertise: (mentor.expertise ?? []).join(", "),
    skills: (mentor.skills ?? []).join(", "),
    email: mentor.email ?? "",
    phone: mentor.phone ?? "",
    linkedin: mentor.linkedin ?? "",
    availability: mentor.availability ?? "",
    guidanceAreas: (mentor.guidanceAreas ?? []).join(", "),
  };
}
