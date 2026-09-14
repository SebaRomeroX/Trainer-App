import * as z from "zod"

export const PlanExerciseSchema = z.object({
  exerciseId: z.string().min(1, { error: "Exercise is required." }),
  targetWeight: z.number().min(0).optional(),
  targetReps: z.number().int().min(1).optional(),
  targetSets: z.number().int().min(1).optional(),
  targetDate: z.string().min(1, { error: "Target date is required." }),
  notes: z.string().max(200).optional(),
})

export const CreatePlanSchema = z.object({
  clientRoutineId: z.string().min(1, { error: "Client routine is required." }),
  exercises: z
    .array(PlanExerciseSchema)
    .min(1, { error: "Add at least one exercise target." }),
})

export const UpdatePlanSchema = z.object({
  exercises: z
    .array(PlanExerciseSchema)
    .min(1, { error: "Add at least one exercise target." })
    .optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
})

export const ResolveSuggestionSchema = z.object({
  action: z.enum(["approved", "denied"]),
  customWeight: z.number().min(0).optional(),
  customReps: z.number().int().min(1).optional(),
  customSets: z.number().int().min(1).optional(),
})

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>
export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>
export type PlanExerciseInput = z.infer<typeof PlanExerciseSchema>
export type ResolveSuggestionInput = z.infer<typeof ResolveSuggestionSchema>
