import * as z from "zod"

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters long." })
    .trim(),
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long." })
    .regex(/[a-zA-Z]/, {
      error: "Password must contain at least one letter.",
    })
    .regex(/[0-9]/, { error: "Password must contain at least one number." }),
  role: z.enum(["trainer", "client"], {
    error: "Please select a valid role.",
  }),
})

export const LoginSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
})

export const ResetPasswordSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
