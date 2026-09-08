import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { WorkoutLog } from "@/models/WorkoutLog"

export async function GET() {
  try {
    const session = await requireRole(["client"])

    await connectDB()

    const now = new Date()

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const [
      totalWorkouts,
      workoutsThisWeek,
      allLogs,
    ] = await Promise.all([
      WorkoutLog.countDocuments({ clientId: session.userId }),
      WorkoutLog.countDocuments({
        clientId: session.userId,
        date: { $gte: startOfWeek },
      }),
      WorkoutLog.find({ clientId: session.userId })
        .sort({ date: -1 })
        .select("date rating")
        .lean(),
    ])

    let averageRating = 0
    const ratedWorkouts = allLogs.filter((l) => l.rating)
    if (ratedWorkouts.length > 0) {
      averageRating =
        ratedWorkouts.reduce((sum, l) => sum + (l.rating || 0), 0) /
        ratedWorkouts.length
    }

    let currentStreak = 0
    if (allLogs.length > 0) {
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)

      const dates = [
        ...new Set(
          allLogs.map((l) => {
            const d = new Date(l.date)
            d.setHours(0, 0, 0, 0)
            return d.getTime()
          })
        ),
      ].sort((a, b) => b - a)

      const hasTodayOrYesterday =
        dates[0] === today.getTime() ||
        dates[0] === today.getTime() - 86400000

      if (hasTodayOrYesterday) {
        currentStreak = 1
        for (let i = 0; i < dates.length - 1; i++) {
          const diff = dates[i] - dates[i + 1]
          if (diff === 86400000) {
            currentStreak++
          } else {
            break
          }
        }
      }
    }

    return NextResponse.json({
      totalWorkouts,
      workoutsThisWeek,
      averageRating: Math.round(averageRating * 10) / 10,
      currentStreak,
    })
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
