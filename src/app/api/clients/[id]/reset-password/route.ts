import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { hashPassword } from "@/lib/auth"
import { generateRandomPassword } from "@/lib/password"
import { checkRateLimit } from "@/lib/rate-limit"
import { ClientProfile } from "@/models/ClientProfile"
import { User } from "@/models/User"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

    const rateKey = `reset-client-password:${session.userId}`
    const { allowed, retryAfterMs } = await checkRateLimit(
      rateKey,
      "reset-password"
    )
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      )
    }

    await connectDB()

    const profile = await ClientProfile.findOne({
      _id: id,
      trainerId: session.userId,
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      )
    }

    const temporaryPassword = generateRandomPassword()
    const hashedPassword = await hashPassword(temporaryPassword)

    const updated = await User.findByIdAndUpdate(profile.userId, {
      $set: { password: hashedPassword },
      $unset: { passwordResetToken: "", passwordResetExpires: "" },
    })

    if (!updated) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 })
    }

    return NextResponse.json({
      temporaryPassword,
      message: "Password has been reset.",
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
