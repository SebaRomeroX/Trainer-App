import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole } from "@/lib/dal"
import { User } from "@/models/User"
import { ClientProfile } from "@/models/ClientProfile"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params

    await connectDB()

    const profile = await ClientProfile.findOne({
      _id: id,
      trainerId: session.userId,
    })
      .populate("userId", "name email avatar createdAt")
      .lean()

    if (!profile) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      )
    }

    const client = {
      _id: profile._id.toString(),
      userId: profile.userId as unknown as {
        _id: { toString(): string }
        name: string
        email: string
        avatar?: string
        createdAt: Date
      },
      fitnessLevel: profile.fitnessLevel,
      goals: profile.goals,
      notes: profile.notes,
      startDate: profile.startDate,
      createdAt: profile.createdAt,
    }

    return NextResponse.json({ client })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params

    await connectDB()

    const profile = await ClientProfile.findOneAndDelete({
      _id: id,
      trainerId: session.userId,
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      )
    }

    await User.findByIdAndDelete(profile.userId)

    return NextResponse.json({ message: "Client removed." })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
