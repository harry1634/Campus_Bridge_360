import { z } from "zod";

export const profileFormSchema = z.object({
  phone: z.string().optional(),
  skills: z.string().optional(),
  projects: z.string().optional(), // one per line: "Title | Description"
  internships: z.string().optional(), // one per line: "Company | Role | Duration"
  certifications: z.string().optional(), // one per line: "Name | Issuer"
  resumeUrl: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  preferredRole: z.string().optional(),
  preferredIndustry: z.string().optional(),
  preferredLocation: z.string().optional(),
});
export type ProfileFormInput = z.infer<typeof profileFormSchema>;

function parseLines(value?: string): string[] {
  return (value ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
}

export function profileFormToPayload(form: ProfileFormInput) {
  return {
    phone: form.phone || "",
    skills: (form.skills ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    projects: parseLines(form.projects).map((line) => {
      const [title, description] = line.split("|").map((s) => s.trim());
      return { title: title || line, description: description || "" };
    }),
    internships: parseLines(form.internships).map((line) => {
      const [company, role, duration] = line.split("|").map((s) => s.trim());
      return { company: company || line, role: role || "", duration: duration || "" };
    }),
    certifications: parseLines(form.certifications).map((line) => {
      const [name, issuer] = line.split("|").map((s) => s.trim());
      return { name: name || line, issuer: issuer || "" };
    }),
    resumeUrl: form.resumeUrl || "",
    linkedin: form.linkedin || "",
    github: form.github || "",
    portfolio: form.portfolio || "",
    preferredRole: form.preferredRole || "",
    preferredIndustry: form.preferredIndustry || "",
    preferredLocation: form.preferredLocation || "",
  };
}
