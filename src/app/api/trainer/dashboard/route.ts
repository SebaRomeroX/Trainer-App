import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { ClientProfile } from "@/models/ClientProfile"
import { WorkoutLog } from "@/models/WorkoutLog"
import { ClientRoutine } from "@/models/ClientRoutine"

const DAY_MS = 86400000

function utcStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/** Normalize a Date to a "YYYY-MM-DD" string in UTC for consistent cross-system comparison */
function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export async function GET() {
  try {
    const session = await requireRole(["trainer"])

    await connectDB()

    const now = new Date()
    const today = utcStartOfDay(now)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * DAY_MS)
    const startOfWeekMs = today.getTime() - today.getUTCDay() * DAY_MS

    // ── 1. Client profiles (indexed on trainerId) ──────────────────────
    const clientProfiles = await ClientProfile.find({ trainerId: session.userId })
      .populate("userId", "name email avatar createdAt")
      .lean()

    const clientUserIds = clientProfiles.map((p) => p.userId._id || p.userId)

    if (clientUserIds.length === 0) {
      return NextResponse.json({
        stats: { totalClients: 0, activeRoutines: 0, workoutsThisWeek: 0, avgRating: 0 },
        clients: [],
        recentActivity: [],
      })
    }

    // ── 2. Workout stats via aggregation (no 500-doc fetch) ───────────
    const [workoutStats, activeRoutineCounts, recentLogs, recentRoutines] =
      await Promise.all([
        // Per-client: total workouts, workouts this week, avg rating
        WorkoutLog.aggregate([
          {
            $match: {
              clientId: { $in: clientUserIds.map((id) => new mongoose.Types.ObjectId(id.toString())) },
              date: { $gte: ninetyDaysAgo },
            },
          },
          {
            $group: {
              _id: "$clientId",
              totalWorkouts: { $sum: 1 },
              workoutsThisWeek: {
                $sum: { $cond: [{ $gte: ["$date", new Date(startOfWeekMs)] }, 1, 0] },
              },
              ratedWorkouts: {
                $push: {
                  $cond: [{ $gt: ["$rating", 0] }, "$rating", null],
                },
              },
              workoutDates: { $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
            },
          },
          {
            $project: {
              totalWorkouts: 1,
              workoutsThisWeek: 1,
              avgRating: {
                $let: {
                  vars: {
                    filtered: {
                      $filter: {
                        input: "$ratedWorkouts",
                        as: "r",
                        cond: { $ne: ["$$r", null] },
                      },
                    },
                  },
                  in: {
                    $cond: [
                      { $gt: [{ $size: "$$filtered" }, 0] },
                      { $round: [{ $avg: "$$filtered" }, 1] },
                      0,
                    ],
                  },
                },
              },
              workoutDates: 1,
            },
          },
        ]),

        // Active routines count + per-client active routine names
        ClientRoutine.aggregate([
          { $match: { clientId: { $in: clientUserIds.map((id) => new mongoose.Types.ObjectId(id.toString())) } } },
          {
            $group: {
              _id: "$clientId",
              activeCount: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
              totalCount: { $sum: 1 },
              completedCount: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
              activeRoutineId: {
                $first: {
                  $cond: [{ $eq: ["$status", "active"] }, "$routineId", null],
                },
              },
            },
          },
        ]),

        // 10 most recent logs for activity feed (lightweight: no exercise details)
        WorkoutLog.find({
          clientId: { $in: clientUserIds.map((id) => new mongoose.Types.ObjectId(id.toString())) },
        })
          .sort({ date: -1 })
          .limit(10)
          .select("clientId routineId date duration rating exercises")
          .populate("routineId", "name")
          .lean(),

        // All client routines (needed for completion rate + active routine lookup)
        ClientRoutine.find({ clientId: { $in: clientUserIds.map((id) => new mongoose.Types.ObjectId(id.toString())) } })
          .populate("routineId", "name")
          .lean(),
      ])

    // ── 3. Build lookup maps ──────────────────────────────────────────
    const statsMap = new Map(workoutStats.map((s) => [s._id.toString(), s]))
    const routineMap = new Map(activeRoutineCounts.map((r) => [r._id.toString(), r]))

    // ── 4. Compute streaks from aggregated date sets (JS-side, lightweight) ──
    const streakMap = new Map<string, number>()
    for (const stat of workoutStats) {
      const clientId = stat._id.toString()
      const dates: string[] = (stat.workoutDates || [])
        .map((d: string) => d) // already "YYYY-MM-DD" from $dateToString
        .sort()
        .reverse()

      if (dates.length === 0) {
        streakMap.set(clientId, 0)
        continue
      }

      const todayKey = utcDateKey(today)
      const yesterdayKey = utcDateKey(new Date(today.getTime() - DAY_MS))

      if (dates[0] !== todayKey && dates[0] !== yesterdayKey) {
        streakMap.set(clientId, 0)
        continue
      }

      let streak = 1
      for (let i = 0; i < dates.length - 1; i++) {
        const curr = new Date(dates[i] + "T00:00:00Z").getTime()
        const next = new Date(dates[i + 1] + "T00:00:00Z").getTime()
        if (curr - next === DAY_MS) {
          streak++
        } else {
          break
        }
      }
      streakMap.set(clientId, streak)
    }

    // ── 5. Assemble client stats ──────────────────────────────────────
    const clientStats = clientProfiles.map((profile) => {
      const userId = (profile.userId as unknown as { _id: { toString(): string } })._id.toString()
      const ws = statsMap.get(userId)
      const rs = routineMap.get(userId)
      const completedRoutines = rs?.completedCount || 0
      const totalRoutines = rs?.totalCount || 0
      const completionRate = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0

      const activeRoutine = recentRoutines.find(
        (cr) => cr.clientId.toString() === userId && cr.status === "active"
      )
      const activeRoutineName =
        activeRoutine && activeRoutine.routineId
          ? (activeRoutine.routineId as unknown as { name: string }).name
          : null

      return {
        clientId: userId,
        name: (profile.userId as unknown as { name: string }).name,
        avatar: (profile.userId as unknown as { avatar?: string }).avatar,
        fitnessLevel: profile.fitnessLevel,
        workoutsThisWeek: ws?.workoutsThisWeek || 0,
        totalWorkouts: ws?.totalWorkouts || 0,
        streak: streakMap.get(userId) || 0,
        activeRoutineName,
        completionRate,
        lastWorkoutDate: null as Date | null,
      }
    })

    // ── 6. Recent activity ────────────────────────────────────────────
    const recentActivity = recentLogs.map((log) => {
      const clientProfile = clientProfiles.find(
        (p) => (p.userId as unknown as { _id: { toString(): string } })._id.toString() === log.clientId.toString()
      )
      const clientName = clientProfile
        ? (clientProfile.userId as unknown as { name: string }).name
        : "Unknown"
      const routineName =
        log.routineId && typeof log.routineId === "object" && "name" in log.routineId
          ? (log.routineId as unknown as { name: string }).name
          : "Unknown"

      const completedCount = log.exercises.filter((e) => e.completed).length

      return {
        workoutLogId: log._id.toString(),
        clientName,
        routineName,
        date: log.date,
        duration: log.duration,
        rating: log.rating,
        exercisesCompleted: completedCount,
        totalExercises: log.exercises.length,
      }
    })

    // ── 7. Summary stats ──────────────────────────────────────────────
    const totalWorkoutsThisWeek = workoutStats.reduce((sum, s) => sum + (s.workoutsThisWeek || 0), 0)
    const allRated = workoutStats.reduce(
      (sum, s) => {
        const ws = s.ratedWorkouts?.filter((r: number | null) => r != null) || []
        return { total: sum.total + ws.length, sum: sum.sum + ws.reduce((a: number, b: number) => a + b, 0) }
      },
      { total: 0, sum: 0 }
    )
    const avgRating = allRated.total > 0 ? Math.round((allRated.sum / allRated.total) * 10) / 10 : 0
    const totalActiveRoutines = activeRoutineCounts.reduce((sum, r) => sum + (r.activeCount || 0), 0)

    return NextResponse.json({
      stats: {
        totalClients: clientProfiles.length,
        activeRoutines: totalActiveRoutines,
        workoutsThisWeek: totalWorkoutsThisWeek,
        avgRating,
      },
      clients: clientStats,
      recentActivity,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (error instanceof Error && error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid data." },
        { status: 400 }
      )
    }
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
