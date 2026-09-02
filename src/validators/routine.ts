import * as z from "zod"

export const RoutineDifficultyEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
])

export const RoutineExerciseSchema = z.object({
  exerciseId: z.string().min(1, { error: "Exercise is required." }),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  restTime: z.number().int().min(0).default(60),
  notes: z.string().max(200).optional(),
  order: z.number().int().min(0),
})

export const CreateRoutineSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Name is required." })
    .max(100, { error: "Name must be 100 characters or less." })
    .trim(),
  description: z
    .string()
    .max(500, { error: "Description must be 500 characters or less." })
    .trim()
    .optional(),
  difficulty: RoutineDifficultyEnum.default("beginner"),
  duration: z.number().int().positive({ error: "Duration is required." }),
  exercises: z
    .array(RoutineExerciseSchema)
    .min(1, { error: "Add at least one exercise." }),
  isTemplate: z.boolean().default(false),
})

export const UpdateRoutineSchema = CreateRoutineSchema.partial()

export type CreateRoutineInput = z.infer<typeof CreateRoutineSchema>
export type UpdateRoutineInput = z.infer<typeof UpdateRoutineSchema>
export type RoutineExerciseInput = z.infer<typeof RoutineExerciseSchema>
