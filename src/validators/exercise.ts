import * as z from "zod"

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
    .trim(),
  description: z.string().max(500, { error: "Description must be 500 characters or less." }).trim().optional(),
  category: ExerciseCategoryEnum,
  muscleGroups: z.array(z.string().trim()).optional().default([]),
  equipment: z.array(z.string().trim()).optional().default([]),
  difficulty: ExerciseDifficultyEnum.default("medium"),
})

export const UpdateExerciseSchema = CreateExerciseSchema.partial()

export type CreateExerciseInput = z.infer<typeof CreateExerciseSchema>
export type UpdateExerciseInput = z.infer<typeof UpdateExerciseSchema>
