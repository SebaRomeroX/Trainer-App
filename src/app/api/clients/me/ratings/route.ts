import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError } from "@/lib/dal"
import { WorkoutLog } from "@/models/WorkoutLog"
import { Feedback } from "@/models/Feedback"

export async function GET() {
  try {
    const session = await requireRole(["client"])

    await connectDB()

    const clientId = session.userId

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
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
