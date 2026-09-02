import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  setRefreshTokenCookie,
  setAccessTokenCookie,
} from "@/lib/auth"
import { RegisterSchema } from "@/validators/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = RegisterSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const existingUser = await User.findOne({
      email: validated.data.email,
    })
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      )
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

    await setRefreshTokenCookie(refreshToken)
    await setAccessTokenCookie(accessToken)

    const response = NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
      { status: 201 }
    )

    return response
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
