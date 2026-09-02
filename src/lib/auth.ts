import "server-only"
import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export interface TokenPayload extends JWTPayload {
  userId: string
  email: string
  role: "trainer" | "client"
}

const accessSecret = new TextEncoder().encode(process.env.JWT_SECRET)
const refreshSecret = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET
)

export async function signAccessToken(
  payload: Omit<TokenPayload, "iat" | "exp" | "iss">
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("trainer-app")
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "15m")
    .sign(accessSecret)
}

export async function signRefreshToken(
  payload: Omit<TokenPayload, "iat" | "exp" | "iss">
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("trainer-app")
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d")
    .sign(refreshSecret)
}

export async function verifyAccessToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret, {
      algorithms: ["HS256"],
      issuer: "trainer-app",
    })
    return payload as TokenPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret, {
      algorithms: ["HS256"],
      issuer: "trainer-app",
    })
    return payload as TokenPayload
  } catch {
    return null
  }
}

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  })
}

export async function setAccessTokenCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  })
}

export async function deleteRefreshTokenCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("refresh_token")
}

export async function deleteAccessTokenCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("access_token")
}

export async function getRefreshTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get("refresh_token")?.value
}
