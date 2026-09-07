import "server-only"
import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export interface TokenPayload extends JWTPayload {
  userId: string
  email: string
  role: "trainer" | "client"
}

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required")
if (!process.env.JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET environment variable is required")

const accessSecret = new TextEncoder().encode(process.env.JWT_SECRET)
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET)

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "15m"
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"

function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/)
  if (!match) return 7 * 24 * 60 * 60
  const value = parseInt(match[1], 10)
  switch (match[2]) {
    case "s": return value
    case "m": return value * 60
    case "h": return value * 60 * 60
    case "d": return value * 24 * 60 * 60
    default: return 7 * 24 * 60 * 60
  }
}

const ACCESS_COOKIE_MAX_AGE = parseDurationToSeconds(ACCESS_EXPIRES_IN)
const REFRESH_COOKIE_MAX_AGE = parseDurationToSeconds(REFRESH_EXPIRES_IN)

export async function signAccessToken(
  payload: Omit<TokenPayload, "iat" | "exp" | "iss">
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("trainer-app")
    .setExpirationTime(ACCESS_EXPIRES_IN)
    .sign(accessSecret)
}

export async function signRefreshToken(
  payload: Omit<TokenPayload, "iat" | "exp" | "iss">
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("trainer-app")
    .setExpirationTime(REFRESH_EXPIRES_IN)
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
    maxAge: REFRESH_COOKIE_MAX_AGE,
  })
}

export async function setAccessTokenCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
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
