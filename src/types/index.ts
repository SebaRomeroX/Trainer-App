export interface FormState {
  errors?: Record<string, string[]>
  message?: string
}

export type UserRole = "trainer" | "client"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}
