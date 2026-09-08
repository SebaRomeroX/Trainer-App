import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { WorkoutLog } from "@/models/WorkoutLog"
import { UpdateWorkoutLogSchema } from "@/validators/workout-log"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["client"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

    await connectDB()

    const log = await WorkoutLog.findOne({
      _id: id,
      clientId: session.userId,
    })
      .populate("routineId", "name difficulty")
      .lean()

    if (!log) {
      return NextResponse.json(
        { error: "Workout log not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ log })
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
    const session = await requireRole(["client"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid
    const body = await request.json()
    const validated = UpdateWorkoutLogSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const log = await WorkoutLog.findOneAndUpdate(
      { _id: id, clientId: session.userId },
      { $set: validated.data },
      { new: true, runValidators: true }
    ).lean()

    if (!log) {
      return NextResponse.json(
        { error: "Workout log not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ log })
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
    const session = await requireRole(["client"])
    const { id } = await params
    const invalid = validateObjectId(id)
    if (invalid) return invalid

    await connectDB()

    const log = await WorkoutLog.findOneAndDelete({
      _id: id,
      clientId: session.userId,
    })

    if (!log) {
      return NextResponse.json(
        { error: "Workout log not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Workout log deleted." })
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
