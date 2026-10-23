import { z } from "zod";

export const inviteTpoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  designation: z.string().optional(),
});
export type InviteTpoInput = z.infer<typeof inviteTpoSchema>;
