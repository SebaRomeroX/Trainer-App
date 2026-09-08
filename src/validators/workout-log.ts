import * as z from "zod"

const WorkoutLogExerciseSchema = z.object({
  exerciseId: z.string().min(1, { error: "Exercise ID is required." }),
  setsCompleted: z.number().min(0, { error: "Sets completed is required." }),
  repsCompleted: z.array(z.number()).optional().default([]),
  weight: z.number().optional(),
  duration: z.number().optional(),
  completed: z.boolean().default(false),
})

export const CreateWorkoutLogSchema = z.object({
  routineId: z.string().min(1, { error: "Routine ID is required." }),
  exercises: z
    .array(WorkoutLogExerciseSchema)
    .min(1, { error: "At least one exercise is required." }),
  notes: z
    .string()
    .max(500, { error: "Notes must be 500 characters or less." })
    .trim()
    .optional(),
  duration: z.number().min(0, { error: "Duration is required." }),
  rating: z.number().min(1).max(5).optional(),
})

export const UpdateWorkoutLogSchema = z.object({
  notes: z
    .string()
    .max(500, { error: "Notes must be 500 characters or less." })
    .trim()
    .optional(),
  rating: z.number().min(1).max(5).optional(),
})

export type CreateWorkoutLogInput = z.infer<typeof CreateWorkoutLogSchema>
export type UpdateWorkoutLogInput = z.infer<typeof UpdateWorkoutLogSchema>
