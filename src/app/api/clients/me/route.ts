import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { ClientProfile } from "@/models/ClientProfile"

export async function GET() {
  try {
    const session = await requireRole(["client"])

    await connectDB()

    const profile = await ClientProfile.findOne({ userId: session.userId })
      .populate("trainerId", "name email avatar")
      .lean()

    if (!profile) {
      return NextResponse.json({ client: null, trainer: null })
    }

    return NextResponse.json({
      client: {
        _id: profile._id.toString(),
        fitnessLevel: profile.fitnessLevel,
        goals: profile.goals,
        notes: profile.notes,
        startDate: profile.startDate,
      },
      trainer: profile.trainerId
        ? {
            _id: (profile.trainerId as unknown as { _id: { toString(): string } })._id.toString(),
            name: (profile.trainerId as unknown as { name: string }).name,
            email: (profile.trainerId as unknown as { email: string }).email,
            avatar: (profile.trainerId as unknown as { avatar?: string }).avatar,
          }
        : null,
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
