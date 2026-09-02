import { NextResponse } from "next/server"
import {
  deleteRefreshTokenCookie,
  deleteAccessTokenCookie,
} from "@/lib/auth"

export async function POST() {
  await deleteRefreshTokenCookie()
  await deleteAccessTokenCookie()

  return NextResponse.json({ success: true })
}
