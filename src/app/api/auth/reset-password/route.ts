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

    // TODO: Generate reset token, store in DB, send email via Resend/Nodemailer
    console.log(`Password reset requested for: ${validated.data.email}`)

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
