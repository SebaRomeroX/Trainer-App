import * as z from "zod"
import { sanitizeStrict, sanitizeArray } from "@/lib/sanitize"

export const CreateClientSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters long." })
    .trim()
    .transform(sanitizeStrict),
  email: z.email({ error: "Please enter a valid email." }).trim(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"], {
    error: "Please select a fitness level.",
  }).default("beginner"),
  goals: z.array(z.string().trim()).optional().default([]).transform(sanitizeArray),
  notes: z.string().max(500, { error: "Notes must be 500 characters or less." }).trim().optional().transform((v) => (v ? sanitizeStrict(v) : v)),
})

export type CreateClientInput = z.infer<typeof CreateClientSchema>

export const UpdateClientSchema = z.object({
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"], {
    error: "Please select a fitness level.",
  }).optional(),
  goals: z.array(z.string().trim()).optional().transform((v) => (v ? sanitizeArray(v) : v)),
  notes: z.string().max(500, { error: "Notes must be 500 characters or less." }).trim().optional().transform((v) => (v ? sanitizeStrict(v) : v)),
})

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>
