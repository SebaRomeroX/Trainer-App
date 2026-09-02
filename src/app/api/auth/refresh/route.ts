import { NextResponse } from "next/server"
import {
  getRefreshTokenFromCookie,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  setRefreshTokenCookie,
  setAccessTokenCookie,
} from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookie()

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token provided." },
        { status: 401 }
      )
    }

    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token." },
        { status: 401 }
      )
    }

    await connectDB()
    const user = await User.findById(payload.userId).select("-password")
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 })
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    }

    const newAccessToken = await signAccessToken(tokenPayload)
    const newRefreshToken = await signRefreshToken(tokenPayload)

    await setRefreshTokenCookie(newRefreshToken)
    await setAccessTokenCookie(newAccessToken)

    return NextResponse.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
