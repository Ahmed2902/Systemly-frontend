// src/modules/auth/auth.schema.ts
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z
    .string()
    .regex(/^(010|011|012|015)\d{8}$/, "Enter a valid Egyptian phone number"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
