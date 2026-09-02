import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole } from "@/lib/dal"
import { Routine } from "@/models/Routine"
import { UpdateRoutineSchema } from "@/validators/routine"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const body = await request.json()
    const validated = UpdateRoutineSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const routine = await Routine.findOneAndUpdate(
      { _id: id, trainerId: session.userId },
      { $set: validated.data },
      { new: true, runValidators: true }
    ).lean()

    if (!routine) {
      return NextResponse.json(
        { error: "Routine not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ routine })
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
