import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { Feedback } from "@/models/Feedback"
import { ClientProfile } from "@/models/ClientProfile"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer"])
    const { id } = await params

    const idError = validateObjectId(id)
    if (idError) return idError

    await connectDB()

    const clientProfile = await ClientProfile.findOne({
      userId: id,
      trainerId: session.userId,
    }).lean()

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Client not found." },
        { status: 404 }
      )
    }

    const feedbacks = await Feedback.find({
      clientId: id,
      trainerId: session.userId,
      type: "client_to_trainer",
    })
      .sort({ createdAt: -1 })
      .populate("routineId", "name")
      .lean()

    return NextResponse.json({ feedbacks })
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
