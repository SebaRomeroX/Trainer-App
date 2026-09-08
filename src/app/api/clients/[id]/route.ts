import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { User } from "@/models/User"
import { ClientProfile } from "@/models/ClientProfile"
import { ClientRoutine } from "@/models/ClientRoutine"
import { WorkoutLog } from "@/models/WorkoutLog"
import { Feedback } from "@/models/Feedback"
import { UpdateClientSchema } from "@/validators/client"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      )
    }

    const validated = UpdateClientSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const profile = await ClientProfile.findOneAndUpdate(
      { _id: id, trainerId: session.userId },
      { $set: validated.data },
      { new: true }
    ).lean()

    if (!profile) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      client: {
        _id: profile._id.toString(),
        fitnessLevel: profile.fitnessLevel,
        goals: profile.goals,
        notes: profile.notes,
      },
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

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

    const userId = profile.userId

    await Promise.all([
      ClientRoutine.deleteMany({ clientId: userId }),
      WorkoutLog.deleteMany({ clientId: userId }),
      Feedback.deleteMany({ clientId: userId }),
      User.findByIdAndDelete(userId),
    ])

    return NextResponse.json({ message: "Client removed." })
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
