import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"

export interface Session {
  isAuth: true
  userId: string
  email: string
  role: "trainer" | "client"
}

export const verifySession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value

  if (!token) return null

  const payload = await verifyAccessToken(token)
  if (!payload) return null

  return {
    isAuth: true,
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  }
})

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  await connectDB()
  const user = await User.findById(session.userId).select("-password").lean()

  if (!user) return null

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  }
})

export async function requireRole(allowedRoles: ("trainer" | "client")[]) {
  const session = await verifySession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden")
  }
  return session
}
