// src/modules/onboarding/onboarding.schema.ts
import { z } from "zod";

export const createBusinessSchema = z.object({
  vertical: z.enum(["salon", "clinic"]),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
  phone: z.string().min(1).max(30),
  city: z.string().max(120).optional(),
  address: z.string().optional(),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
