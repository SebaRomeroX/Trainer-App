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
import { verifySession } from "@/lib/dal"
import { checkRateLimit } from "@/lib/rate-limit"
import { RegisterSchema, LoginSchema, ChangePasswordSchema } from "@/validators/auth"
import type { FormState } from "@/types"

export async function register(
  _prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const validated = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
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
    role: "client",
  })

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    isAdmin: false,
  }

  const accessToken = await signAccessToken(tokenPayload)
  const refreshToken = await signRefreshToken(tokenPayload)

  await setAccessTokenCookie(accessToken)
  await setRefreshTokenCookie(refreshToken)

  redirect("/dashboard/client")
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
    "+password +isAdmin"
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
    isAdmin: user.isAdmin ?? false,
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

export async function changePassword(
  _prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const session = await verifySession()
  if (!session) {
    return { message: "Your session has expired. Please sign in again." }
  }

  const validated = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { allowed, retryAfterMs } = await checkRateLimit(
    `change-password:${session.userId}`,
    "change-password"
  )
  if (!allowed) {
    return {
      message: `Too many attempts. Please try again in ${Math.ceil(
        retryAfterMs / 1000
      )} seconds.`,
    }
  }

  await connectDB()

  const user = await User.findById(session.userId).select(
    "+password +passwordResetToken +passwordResetExpires"
  )
  if (!user) {
    return { message: "Your session has expired. Please sign in again." }
  }

  if (!(await verifyPassword(validated.data.currentPassword, user.password))) {
    return {
      errors: { currentPassword: ["Current password is incorrect."] },
    }
  }

  user.password = await hashPassword(validated.data.newPassword)
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save({ validateModifiedOnly: true })

  return { message: "Password updated successfully.", success: true }
}
