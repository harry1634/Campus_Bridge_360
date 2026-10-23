import { z } from "zod";

export const updateFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  body: z.string().min(5, "Add a short message"),
  category: z.enum([
    "new_drive",
    "interview_schedule",
    "assessment",
    "company_update",
    "deadline_reminder",
    "selection_announcement",
    "notice",
  ]),
  audienceDepartments: z.string().optional(),
});
export type UpdateFormInput = z.infer<typeof updateFormSchema>;

export const updatePayloadSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(5),
  category: z.enum([
    "new_drive",
    "interview_schedule",
    "assessment",
    "company_update",
    "deadline_reminder",
    "selection_announcement",
    "notice",
  ]),
  audience: z.union([z.literal("all"), z.array(z.string())]),
});
export type UpdateInput = z.infer<typeof updatePayloadSchema>;

export function updateFormToPayload(form: UpdateFormInput): UpdateInput {
  const departments = (form.audienceDepartments ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    title: form.title,
    body: form.body,
    category: form.category,
    audience: departments.length > 0 ? departments : "all",
  };
}

// Reverse of updateFormToPayload — used to pre-fill the edit form from a
// stored update record.
export function updateToFormInput(update: {
  title: string;
  body: string;
  category: UpdateFormInput["category"];
  audience: "all" | string[];
}): UpdateFormInput {
  return {
    title: update.title,
    body: update.body,
    category: update.category,
    audienceDepartments: update.audience === "all" ? "" : update.audience.join(", "),
  };
}
