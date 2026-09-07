import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Exercise } from "@/models/Exercise"
import { Routine } from "@/models/Routine"
import { UpdateExerciseSchema } from "@/validators/exercise"

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

    const exercise = await Exercise.findOne({
      _id: id,
      trainerId: session.userId,
    }).lean()

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ exercise })
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
    const validated = UpdateExerciseSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const exercise = await Exercise.findOneAndUpdate(
      { _id: id, trainerId: session.userId },
      { $set: validated.data },
      { new: true, runValidators: true }
    ).lean()

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ exercise })
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

    const exercise = await Exercise.findOneAndDelete({
      _id: id,
      trainerId: session.userId,
    })

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found." },
        { status: 404 }
      )
    }

    await Routine.updateMany(
      { "exercises.exerciseId": id },
      { $pull: { exercises: { exerciseId: id } } }
    )

    return NextResponse.json({ message: "Exercise deleted." })
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
