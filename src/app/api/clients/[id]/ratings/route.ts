import { NextResponse } from "next/server"
import { connectDB, validateObjectId } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { WorkoutLog } from "@/models/WorkoutLog"
import { Feedback } from "@/models/Feedback"
import { ClientProfile } from "@/models/ClientProfile"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["trainer", "client"])
    const { id } = await params

    const idError = validateObjectId(id)
    if (idError) return idError

    await connectDB()

    const clientId = id

    if (session.role === "trainer") {
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
    } else if (id !== session.userId.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [workoutLogs, feedbacks] = await Promise.all([
      WorkoutLog.find({ clientId })
        .select("date rating")
        .sort({ date: 1 })
        .lean(),
      Feedback.find({ clientId, type: "client_to_trainer" })
        .select("createdAt difficultyRating enjoymentRating")
        .sort({ createdAt: 1 })
        .lean(),
    ])

    const ratings = workoutLogs
      .filter((log) => log.rating != null)
      .map((log) => ({
        date: log.date.toISOString().split("T")[0],
        workoutRating: log.rating,
        type: "workout" as const,
      }))

    const feedbackRatings = feedbacks.map((fb) => ({
      date: fb.createdAt.toISOString().split("T")[0],
      difficultyRating: fb.difficultyRating,
      enjoymentRating: fb.enjoymentRating,
      type: "feedback" as const,
    }))

    return NextResponse.json({ ratings, feedbackRatings })
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
