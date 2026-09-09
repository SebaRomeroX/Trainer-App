import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Routine } from "@/models/Routine"
import { UpdateRoutineSchema } from "@/validators/routine"
import { logRoutineChange } from "@/lib/routine-changes"

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

    const routine = await Routine.findOne({
      _id: id,
      trainerId: session.userId,
    })
      .populate("exercises.exerciseId", "name category difficulty")
      .lean()

    if (!routine) {
      return NextResponse.json(
        { error: "Routine not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ routine })
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
    const body = await request.json()
    const validated = UpdateRoutineSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const oldRoutine = await Routine.findOne({
      _id: id,
      trainerId: session.userId,
    }).lean()

    if (!oldRoutine) {
      return NextResponse.json(
        { error: "Routine not found." },
        { status: 404 }
      )
    }

    const routine = await Routine.findOneAndUpdate(
      { _id: id, trainerId: session.userId },
      { $set: validated.data },
      { new: true, runValidators: true }
    ).lean()

    const changes: { field: string; before: unknown; after: unknown }[] = []
    for (const [key, value] of Object.entries(validated.data)) {
      const oldVal = JSON.stringify(oldRoutine[key as keyof typeof oldRoutine])
      const newVal = JSON.stringify(value)
      if (oldVal !== newVal) {
        changes.push({
          field: key,
          before: oldRoutine[key as keyof typeof oldRoutine],
          after: value,
        })
      }
    }

    const fieldNames = changes.map((c) => c.field).join(", ")
    logRoutineChange({
      routineId: id,
      trainerId: session.userId.toString(),
      changeType: "routine_updated",
      description: `Routine updated: ${fieldNames}`,
      changes,
    }).catch(console.error)

    return NextResponse.json({ routine })
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

    const routine = await Routine.findOneAndDelete({
      _id: id,
      trainerId: session.userId,
    })

    if (!routine) {
      return NextResponse.json(
        { error: "Routine not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Routine deleted." })
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
