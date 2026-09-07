import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { ClientRoutine } from "@/models/ClientRoutine"

export async function GET() {
  try {
    const session = await requireRole(["client"])

    await connectDB()

    const assignments = await ClientRoutine.find({ clientId: session.userId })
      .populate("routineId", "name description difficulty duration exercises")
      .sort({ assignedDate: -1 })
      .lean()

    const routines = assignments.map((a) => ({
      _id: a._id.toString(),
      routine: a.routineId,
      assignedDate: a.assignedDate,
      startDate: a.startDate,
      endDate: a.endDate,
      status: a.status,
      progress: a.progress,
    }))

    return NextResponse.json({ routines })
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
