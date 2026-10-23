import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  studentId: z.string().min(1, "Student ID is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  department: z.string().min(1, "Department is required"),
  batch: z.string().min(1, "Batch is required"),
  graduationYear: z.coerce.number().int().min(2020).max(2035),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
