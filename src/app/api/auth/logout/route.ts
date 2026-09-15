import { NextResponse } from "next/server"
import {
  deleteRefreshTokenCookie,
  deleteAccessTokenCookie,
  getRefreshTokenFromCookie,
  revokeRefreshToken,
} from "@/lib/auth"

export async function POST() {
  const refreshToken = await getRefreshTokenFromCookie()
  if (refreshToken) {
    await revokeRefreshToken(refreshToken)
  }

  await deleteRefreshTokenCookie()
  await deleteAccessTokenCookie()

  return NextResponse.json({ success: true })
}
