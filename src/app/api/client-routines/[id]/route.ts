import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole } from "@/lib/dal"
import { ClientRoutine } from "@/models/ClientRoutine"
import { ClientProfile } from "@/models/ClientProfile"
import * as z from "zod"

const UpdateClientRoutineSchema = z.object({
  status: z.enum(["active", "completed", "paused"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer", "client"])
    const { id } = await params
    const body = await request.json()
    const validated = UpdateClientRoutineSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const assignment = await ClientRoutine.findById(id).lean()

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      )
    }

    if (session.role === "trainer") {
      const clientProfile = await ClientProfile.findOne({
        userId: assignment.clientId,
        trainerId: session.userId,
      }).lean()

      if (!clientProfile) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }
    } else if (assignment.clientId.toString() !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = { ...validated.data }

    if (
      validated.data.status === "completed" ||
      validated.data.status === "paused"
    ) {
      updateData.endDate = new Date()
    }

    const updated = await ClientRoutine.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean()

    return NextResponse.json({ assignment: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
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

    await connectDB()

    const assignment = await ClientRoutine.findById(id).lean()

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      )
    }

    const clientProfile = await ClientProfile.findOne({
      userId: assignment.clientId,
      trainerId: session.userId,
    }).lean()

    if (!clientProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await ClientRoutine.findByIdAndDelete(id)

    return NextResponse.json({ message: "Assignment removed." })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
