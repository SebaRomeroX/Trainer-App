"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dumbbell,
  Clock,
  Calendar,
  Play,
  Flame,
  TrendingUp,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

interface RoutineData {
  _id: string
  name: string
  difficulty: string
  duration: number
  description?: string
}

interface Assignment {
  _id: string
  routine: RoutineData
  assignedDate: string
  startDate: string
  endDate?: string
  status: "active" | "scheduled" | "completed" | "paused"
  progress: number
}

interface Stats {
  workoutsThisWeek: number
  currentStreak: number
}

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function ClientDashboardPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const [routinesRes, statsRes] = await Promise.all([
          fetch("/api/clients/me/routines"),
          fetch("/api/workout-logs/stats"),
        ])

        if (!cancelled) {
          if (routinesRes.ok) {
            const data = await routinesRes.json()
            setAssignments(data.routines ?? [])
          } else {
            setFetchError(true)
          }

          if (statsRes.ok) {
            const data = await statsRes.json()
            setStats({
              workoutsThisWeek: data.workoutsThisWeek,
              currentStreak: data.currentStreak,
            })
          }
        }
      } catch {
        if (!cancelled) setFetchError(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const activeAssignment = assignments.find((a) => a.status === "active")
  const scheduledAssignment = assignments.find((a) => a.status === "scheduled")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
        My Workouts
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        View your assigned routines and track your progress.
      </p>

      {isLoading ? (
        <p className="text-zinc-500">Loading your routines...</p>
      ) : fetchError ? (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
          <p className="text-red-600 dark:text-red-400">
            Failed to load routines. Please try again later.
          </p>
        </div>
      ) : (
        <>
          {stats && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-zinc-500" />
                  <h3 className="text-sm font-medium text-zinc-500">This Week</h3>
                </div>
                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-zinc-100">
                  {stats.workoutsThisWeek} workout{stats.workoutsThisWeek !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                <div className="flex items-center gap-2">
                  <Flame className="size-4 text-zinc-500" />
                  <h3 className="text-sm font-medium text-zinc-500">Streak</h3>
                </div>
                <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-zinc-100">
                  {stats.currentStreak} day{stats.currentStreak !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {activeAssignment ? (
            <div className="rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
                      {activeAssignment.routine.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={difficultyColors[activeAssignment.routine.difficulty]}
                    >
                      {activeAssignment.routine.difficulty}
                    </Badge>
                  </div>
                  {activeAssignment.routine.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {activeAssignment.routine.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <Dumbbell className="size-3.5" />
                      {activeAssignment.routine.duration} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      Started{" "}
                      {new Date(activeAssignment.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Link href={`/dashboard/client/workout/${activeAssignment._id}`}>
                  <Button size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Start Workout
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
              <h3 className="text-sm font-medium text-zinc-500">
                Active Routine
              </h3>
              <p className="mt-2 text-zinc-950 dark:text-zinc-100">
                No active routine assigned yet. Your trainer will assign one soon.
              </p>
            </div>
          )}

          {scheduledAssignment && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-zinc-500">Upcoming</h3>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  scheduled
                </Badge>
              </div>
              <p className="mt-2 font-medium text-zinc-950 dark:text-zinc-100">
                {scheduledAssignment.routine.name}
              </p>
              <p className="text-sm text-zinc-500 inline-flex items-center gap-1 mt-1">
                <Clock className="size-3.5" />
                Starts {new Date(scheduledAssignment.startDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <Link
            href="/dashboard/client/feedback"
            className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <MessageSquare className="size-5 text-zinc-500" />
            <div>
              <p className="font-medium text-zinc-950 dark:text-zinc-100">
                Send Feedback
              </p>
              <p className="text-sm text-zinc-500">
                Let your trainer know how your workouts are going
              </p>
            </div>
          </Link>
        </>
      )}
    </div>
  )
}
