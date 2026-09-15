import * as z from "zod"
import { sanitizeStrict, sanitizeArray } from "@/lib/sanitize"

export const ExerciseCategoryEnum = z.enum([
  "strength",
  "cardio",
  "flexibility",
  "balance",
  "other",
])

export const ExerciseDifficultyEnum = z.enum(["easy", "medium", "hard"])

export const CreateExerciseSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Name is required." })
    .max(100, { error: "Name must be 100 characters or less." })
    .trim()
    .transform(sanitizeStrict),
  description: z.string().max(500, { error: "Description must be 500 characters or less." }).trim().optional().transform((v) => (v ? sanitizeStrict(v) : v)),
  category: ExerciseCategoryEnum,
  muscleGroups: z.array(z.string().trim()).optional().default([]).transform(sanitizeArray),
  equipment: z.array(z.string().trim()).optional().default([]).transform(sanitizeArray),
  difficulty: ExerciseDifficultyEnum.default("medium"),
  videoUrl: z.string().url({ error: "Please enter a valid URL." }).optional(),
  imageUrl: z.string().url({ error: "Please enter a valid URL." }).optional(),
})

export const UpdateExerciseSchema = CreateExerciseSchema.partial()

export type CreateExerciseInput = z.infer<typeof CreateExerciseSchema>
export type UpdateExerciseInput = z.infer<typeof UpdateExerciseSchema>
