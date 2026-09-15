import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { hashPassword } from "@/lib/auth"
import * as z from "zod"
import crypto from "crypto"

const ConfirmResetSchema = z.object({
  token: z.string().min(1, { error: "Reset token is required." }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long." })
    .regex(/[a-zA-Z]/, {
      error: "Password must contain at least one letter.",
    })
    .regex(/[0-9]/, { error: "Password must contain at least one number." }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = ConfirmResetSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(validated.data.token)
      .digest("hex")

    await connectDB()
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires")

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      )
    }

    user.password = await hashPassword(validated.data.password)
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateModifiedOnly: true })

    return NextResponse.json({
      message: "Password has been reset successfully.",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
