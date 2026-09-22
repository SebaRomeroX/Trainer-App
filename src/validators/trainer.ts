import * as z from "zod"
import { sanitizeStrict, sanitizeArray } from "@/lib/sanitize"

export const CreateTrainerSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters long." })
    .trim()
    .transform(sanitizeStrict),
  email: z.email({ error: "Please enter a valid email." }).trim(),
  bio: z.string().max(500, { error: "Bio must be 500 characters or less." }).trim().optional().transform((v) => (v ? sanitizeStrict(v) : v)),
  specialties: z.array(z.string().trim()).optional().default([]).transform(sanitizeArray),
})

export type CreateTrainerInput = z.infer<typeof CreateTrainerSchema>
