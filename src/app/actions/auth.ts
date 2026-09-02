"use server"

import { redirect } from "next/navigation"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  setRefreshTokenCookie,
  setAccessTokenCookie,
  deleteRefreshTokenCookie,
  deleteAccessTokenCookie,
} from "@/lib/auth"
import { RegisterSchema, LoginSchema } from "@/validators/auth"
import type { FormState } from "@/types"

export async function register(
  _prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const validated = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  await connectDB()

  const existingUser = await User.findOne({ email: validated.data.email })
  if (existingUser) {
    return {
      errors: { email: ["An account with this email already exists."] },
    }
  }

  const hashedPassword = await hashPassword(validated.data.password)
  const user = await User.create({
    ...validated.data,
    password: hashedPassword,
  })

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }

  const accessToken = await signAccessToken(tokenPayload)
  const refreshToken = await signRefreshToken(tokenPayload)

  await setAccessTokenCookie(accessToken)
  await setRefreshTokenCookie(refreshToken)

  redirect(user.role === "trainer" ? "/dashboard/trainer" : "/dashboard/client")
}

export async function login(
  _prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  await connectDB()

  const user = await User.findOne({ email: validated.data.email }).select(
    "+password"
  )

  if (
    !user ||
    !(await verifyPassword(validated.data.password, user.password))
  ) {
    return { message: "Invalid email or password." }
  }

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }

  const accessToken = await signAccessToken(tokenPayload)
  const refreshToken = await signRefreshToken(tokenPayload)

  await setAccessTokenCookie(accessToken)
  await setRefreshTokenCookie(refreshToken)

  redirect(user.role === "trainer" ? "/dashboard/trainer" : "/dashboard/client")
}

export async function logout() {
  await deleteRefreshTokenCookie()
  await deleteAccessTokenCookie()
  redirect("/login")
}
