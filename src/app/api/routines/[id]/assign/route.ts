import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Routine } from "@/models/Routine"
import { ClientRoutine } from "@/models/ClientRoutine"
import { ClientProfile } from "@/models/ClientProfile"
import { AssignRoutineSchema } from "@/validators/routine"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const body = await request.json()
    const validated = AssignRoutineSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await connectDB()

    const routine = await Routine.findOne({
      _id: id,
      trainerId: session.userId,
    }).lean()

    if (!routine) {
      return NextResponse.json(
        { error: "Routine not found." },
        { status: 404 }
      )
    }

    const clientProfile = await ClientProfile.findOne({
      _id: validated.data.clientId,
      trainerId: session.userId,
    }).lean()

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      )
    }

    const existingAssignment = await ClientRoutine.findOne({
      clientId: validated.data.clientId,
      routineId: id,
      status: { $in: ["active", "scheduled"] },
    }).lean()

    if (existingAssignment) {
      return NextResponse.json(
        {
          error:
            "This routine is already assigned to this client.",
        },
        { status: 400 }
      )
    }

    const activeAssignment = await ClientRoutine.findOne({
      clientId: validated.data.clientId,
      status: "active",
    }).lean()

    const startDate = validated.data.startDate
      ? new Date(validated.data.startDate)
      : new Date()

    const isStartToday =
      startDate.toISOString().split("T")[0] ===
      new Date().toISOString().split("T")[0]

    if (activeAssignment && !validated.data.startDate) {
      return NextResponse.json(
        {
          error:
            "This client already has an active routine. Provide a start date to schedule this routine.",
        },
        { status: 400 }
      )
    }

    if (activeAssignment && isStartToday) {
      await ClientRoutine.findByIdAndUpdate(activeAssignment._id, {
        status: "completed",
        endDate: new Date(),
      })
    }

    const status = activeAssignment && !isStartToday ? "scheduled" : "active"

    const clientRoutine = await ClientRoutine.create({
      clientId: validated.data.clientId,
      routineId: id,
      startDate,
      status,
    })

    return NextResponse.json({ assignment: clientRoutine }, { status: 201 })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params
    const body = await request.json()

    if (!body.clientId) {
      return NextResponse.json(
        { error: "Client ID is required." },
        { status: 400 }
      )
    }

    await connectDB()

    const clientProfile = await ClientProfile.findOne({
      _id: body.clientId,
      trainerId: session.userId,
    }).lean()

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      )
    }

    const assignment = await ClientRoutine.findOneAndDelete({
      routineId: id,
      clientId: body.clientId,
      status: { $in: ["active", "scheduled"] },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found." },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Routine unassigned." })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
