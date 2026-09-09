import * as z from "zod"

export const CreateFeedbackSchema = z.object({
  routineId: z.string().optional(),
  workoutLogId: z.string().optional(),
  difficultyRating: z.number().min(1).max(5, { error: "Difficulty must be 1-5." }),
  enjoymentRating: z.number().min(1).max(5, { error: "Enjoyment must be 1-5." }),
  message: z
    .string()
    .max(500, { error: "Message must be 500 characters or less." })
    .trim()
    .min(1, { error: "Message cannot be only whitespace." })
    .optional(),
})

export type CreateFeedbackInput = z.infer<typeof CreateFeedbackSchema>
