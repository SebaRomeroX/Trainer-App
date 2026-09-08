import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { WorkoutLog } from "@/models/WorkoutLog"
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

    const logs = await WorkoutLog.find({ clientId: clientProfile.userId })
      .populate("routineId", "name difficulty")
      .sort({ date: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ logs })
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
