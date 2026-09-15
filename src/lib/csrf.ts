import "server-only"
import { cookies } from "next/headers"
import { createHmac, randomBytes } from "crypto"

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET
const CSRF_COOKIE = "csrf_token"
const CSRF_HEADER = "x-csrf-token"
const TOKEN_LENGTH = 32
const MAX_AGE = 60 * 60 // 1 hour

if (!CSRF_SECRET) {
  throw new Error("CSRF_SECRET or JWT_SECRET environment variable is required")
}

function sign(token: string): string {
  return createHmac("sha256", CSRF_SECRET!).update(token).digest("hex")
}

export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(TOKEN_LENGTH).toString("hex")
  const signature = sign(token)
  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE, `${token}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  })
  return token
}

export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(CSRF_COOKIE)?.value
  const headerToken = request.headers.get(CSRF_HEADER)

  if (!cookieValue || !headerToken) return false

  const [cookieToken, cookieSignature] = cookieValue.split(".")
  const expectedSignature = sign(cookieToken)

  if (cookieSignature !== expectedSignature) return false
  if (cookieToken !== headerToken) return false

  return true
}

export function getCsrfHeaderName(): string {
  return CSRF_HEADER
}
