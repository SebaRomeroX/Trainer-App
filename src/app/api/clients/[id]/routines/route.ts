import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole } from "@/lib/dal"
import { ClientRoutine } from "@/models/ClientRoutine"
import { ClientProfile } from "@/models/ClientProfile"

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

    const clientProfile = await ClientProfile.findOne({
      _id: id,
      trainerId: session.userId,
    }).lean()

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      )
    }

    const assignments = await ClientRoutine.find({ clientId: id })
      .populate("routineId", "name description difficulty duration")
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
