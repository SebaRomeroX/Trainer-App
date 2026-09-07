import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { ResetPasswordSchema } from "@/validators/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = ResetPasswordSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()
    const user = await User.findOne({ email: validated.data.email })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent.",
      })
    }

    // NOTE: Password reset is not implemented. The endpoint intentionally returns
    // a generic success response to prevent email enumeration.
    // To implement: generate a reset token, store in DB, send email via Resend/Nodemailer.

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent.",
    })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
