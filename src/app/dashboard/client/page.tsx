"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, Clock, Calendar } from "lucide-react"

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

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  scheduled:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed:
    "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
  paused:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
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
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchRoutines() {
      try {
        const res = await fetch("/api/clients/me/routines")
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) setAssignments(data.routines)
        } else {
          if (!cancelled) setFetchError(true)
        }
      } catch (error) {
        console.error("Failed to load routines:", error)
        if (!cancelled) setFetchError(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchRoutines()
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-500">
                Active Routine
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeAssignment ? (
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
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400">
                  No active routine assigned yet. Your trainer will assign one
                  soon.
                </p>
              )}
            </CardContent>
          </Card>

          {scheduledAssignment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-500">
                  Upcoming Routine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
                      {scheduledAssignment.routine.name}
                    </h3>
                    <Badge variant="outline" className={statusColors.scheduled}>
                      scheduled
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      Starts{" "}
                      {new Date(
                        scheduledAssignment.startDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!activeAssignment && !scheduledAssignment && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
              <h3 className="text-sm font-medium text-zinc-500">
                Active Routine
              </h3>
              <p className="mt-2 text-zinc-950 dark:text-zinc-100">
                No active routine assigned yet.
              </p>
            </div>
          )}

          {assignments.filter(
            (a) => a.status === "completed" || a.status === "paused"
          ).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-500">
                  Past Routines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assignments
                    .filter(
                      (a) => a.status === "completed" || a.status === "paused"
                    )
                    .map((assignment) => (
                      <div
                        key={assignment._id}
                        className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
                      >
                        <div>
                          <p className="font-medium text-zinc-950 dark:text-zinc-100">
                            {assignment.routine.name}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {assignment.routine.duration} min
                            {assignment.endDate && (
                              <>
                                {" "}
                                &middot; Ended{" "}
                                {new Date(
                                  assignment.endDate
                                ).toLocaleDateString()}
                              </>
                            )}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={statusColors[assignment.status]}
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
