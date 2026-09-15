import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { WorkoutLog } from "@/models/WorkoutLog"

const DAY_MS = 86400000

function utcStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export async function GET() {
  try {
    const session = await requireRole(["client"])

    await connectDB()

    const now = new Date()
    const today = utcStartOfDay(now)
    const startOfWeekMs = today.getTime() - today.getUTCDay() * DAY_MS
    const startOfWeek = new Date(startOfWeekMs)

    const [totalWorkouts, workoutsThisWeek, ratingAgg, recentLogs] =
      await Promise.all([
        WorkoutLog.countDocuments({ clientId: session.userId }),
        WorkoutLog.countDocuments({
          clientId: session.userId,
          date: { $gte: startOfWeek },
        }),
        WorkoutLog.aggregate([
          {
            $match: {
              clientId: new mongoose.Types.ObjectId(session.userId),
              rating: { $exists: true, $ne: null },
            },
          },
          { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
        ]),
        WorkoutLog.find({ clientId: session.userId })
          .sort({ date: -1 })
          .limit(365)
          .select("date")
          .lean(),
      ])

    const averageRating =
      ratingAgg.length > 0 ? Math.round(ratingAgg[0].avg * 10) / 10 : 0

    let currentStreak = 0
    if (recentLogs.length > 0) {
      const dates = [
        ...new Set(
          recentLogs.map((l) => utcStartOfDay(new Date(l.date)).getTime())
        ),
      ].sort((a, b) => b - a)

      const hasTodayOrYesterday =
        dates[0] === today.getTime() ||
        dates[0] === today.getTime() - DAY_MS

      if (hasTodayOrYesterday) {
        currentStreak = 1
        for (let i = 0; i < dates.length - 1; i++) {
          if (dates[i] - dates[i + 1] === DAY_MS) {
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
