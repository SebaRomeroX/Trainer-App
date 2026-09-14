import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { ClientProfile } from "@/models/ClientProfile"

export async function PUT() {
  try {
    const session = await requireRole(["client"])

    await connectDB()

    const profile = await ClientProfile.findOneAndUpdate(
      { userId: session.userId },
      { hasCompletedOnboarding: true },
      { new: true }
    ).lean()

    if (!profile) {
      return NextResponse.json(
        { error: "Client profile not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
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
