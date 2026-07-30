// src/modules/auth/auth.schema.ts
import { z } from "zod";

const emailSchema = z.string().email("Enter a valid email address");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be 100 characters or fewer");

export const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name").max(100),
  email: emailSchema,
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^(010|011|012|015)\d{8}$/, "Enter a valid Egyptian phone number"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const emailRequestSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EmailRequestInput = z.infer<typeof emailRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
