import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/dal"
import { ClientProfile } from "@/models/ClientProfile"
import { WorkoutLog } from "@/models/WorkoutLog"
import { ClientRoutine } from "@/models/ClientRoutine"

export async function GET() {
  try {
    const session = await requireRole(["trainer"])

    await connectDB()

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const clientProfiles = await ClientProfile.find({ trainerId: session.userId })
      .populate("userId", "name email avatar createdAt")
      .lean()

    const clientUserIds = clientProfiles.map((p) => p.userId._id || p.userId)

    const [allWorkoutLogs, allClientRoutines] = await Promise.all([
      WorkoutLog.find({ clientId: { $in: clientUserIds } })
        .sort({ date: -1 })
        .populate("routineId", "name")
        .lean(),
      ClientRoutine.find({ clientId: { $in: clientUserIds } })
        .populate("routineId", "name")
        .lean(),
    ])

    const workoutsThisWeek = allWorkoutLogs.filter(
      (w) => new Date(w.date) >= startOfWeek
    ).length

    const ratedWorkouts = allWorkoutLogs.filter(
      (w) => w.rating != null && w.rating > 0
    )
    const avgRating =
      ratedWorkouts.length > 0
        ? Math.round(
            (ratedWorkouts.reduce((sum, w) => sum + w.rating!, 0) /
              ratedWorkouts.length) *
              10
          ) / 10
        : 0

    const clientStats = clientProfiles.map((profile) => {
      const userId = (profile.userId as unknown as { _id: { toString(): string }; name: string; email: string; avatar?: string })._id.toString()
      const clientLogs = allWorkoutLogs.filter(
        (w) => w.clientId.toString() === userId
      )
      const clientRoutines = allClientRoutines.filter(
        (cr) => cr.clientId.toString() === userId
      )

      const completedRoutines = clientRoutines.filter(
        (cr) => cr.status === "completed"
      ).length
      const totalRoutines = clientRoutines.length
      const completionRate =
        totalRoutines > 0
          ? Math.round((completedRoutines / totalRoutines) * 100)
          : 0

      const activeRoutine = clientRoutines.find((cr) => cr.status === "active")
      const activeRoutineName =
        activeRoutine && activeRoutine.routineId
          ? (activeRoutine.routineId as unknown as { name: string }).name
          : null

      const workoutsThisWeekByClient = clientLogs.filter(
        (w) => new Date(w.date) >= startOfWeek
      ).length

      let streak = 0
      if (clientLogs.length > 0) {
        const dayMs = 86400000
        const today = new Date(now)
        today.setHours(0, 0, 0, 0)

        const dates = [
          ...new Set(
            clientLogs.map((l) => {
              const d = new Date(l.date)
              d.setHours(0, 0, 0, 0)
              return d.getTime()
            })
          ),
        ].sort((a, b) => b - a)

        const hasTodayOrYesterday =
          dates[0] === today.getTime() ||
          dates[0] === today.getTime() - dayMs

        if (hasTodayOrYesterday) {
          streak = 1
          for (let i = 0; i < dates.length - 1; i++) {
            if (dates[i] - dates[i + 1] === dayMs) {
              streak++
            } else {
              break
            }
          }
        }
      }

      const lastWorkout = clientLogs.length > 0 ? clientLogs[0].date : null

      return {
        clientId: userId,
        name: (profile.userId as unknown as { name: string }).name,
        avatar: (profile.userId as unknown as { avatar?: string }).avatar,
        fitnessLevel: profile.fitnessLevel,
        workoutsThisWeek: workoutsThisWeekByClient,
        totalWorkouts: clientLogs.length,
        streak,
        activeRoutineName,
        completionRate,
        lastWorkoutDate: lastWorkout,
      }
    })

    const recentActivity = allWorkoutLogs.slice(0, 10).map((log) => {
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

    return NextResponse.json({
      stats: {
        totalClients: clientProfiles.length,
        activeRoutines: allClientRoutines.filter((cr) => cr.status === "active")
          .length,
        workoutsThisWeek,
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
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
