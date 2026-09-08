import * as z from "zod"

export const SendMessageSchema = z.object({
  receiverId: z.string().min(1, { error: "Recipient is required." }),
  content: z
    .string()
    .min(1, { error: "Message cannot be empty." })
    .max(1000, { error: "Message must be 1000 characters or less." })
    .trim(),
})

export type SendMessageInput = z.infer<typeof SendMessageSchema>
