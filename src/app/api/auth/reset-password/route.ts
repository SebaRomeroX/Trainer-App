import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/User"
import { ResetPasswordSchema } from "@/validators/auth"
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const rateKey = getRateLimitKey(request, "reset-password")
    const { allowed, retryAfterMs } = checkRateLimit(rateKey, 3, 60_000)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      )
    }

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

    const resetToken = crypto.randomUUID()
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    user.passwordResetToken = hashedToken
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save({ validateModifiedOnly: true })

    // TODO: Send resetToken via email (Resend/Nodemailer)
    // For now, return the token directly for development/testing
    return NextResponse.json({
      message: "If an account exists, a reset link has been sent.",
      ...(process.env.NODE_ENV !== "production" && { resetToken }),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
