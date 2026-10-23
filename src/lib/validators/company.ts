import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  industry: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  description: z.string().optional(),
});
export type CompanyInput = z.infer<typeof companySchema>;
