"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

interface ExerciseDetail {
  _id: string
  name: string
  category: string
}

interface LoggedExercise {
  exerciseId: ExerciseDetail
  setsCompleted: number
  repsCompleted: number[]
  weight?: number
  completed: boolean
}

export interface WorkoutLogDetail {
  _id: string
  routineId: {
    name: string
    difficulty: string
  }
  date: string
  duration: number
  rating?: number
  notes?: string
  exercises: LoggedExercise[]
}

export function WorkoutLogDetailClient({ log }: { log: WorkoutLogDetail }) {
  const router = useRouter()
  const completed = log.exercises.filter((e) => e.completed).length

  const handleDelete = async () => {
    if (!confirm("Delete this workout log?")) return
    try {
      const res = await fetch(`/api/workout-logs/${log._id}`, {
        method: "DELETE",
      })
      if (res.ok) router.push("/dashboard/client/history")
    } catch {
      // keep page as-is on error
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <Link
          href="/dashboard/client/history"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
              {log.routineId.name}
            </h1>
            <p className="text-sm text-zinc-500">
              {new Date(log.date).toLocaleDateString()} &middot; {log.duration} min
              &middot; {completed}/{log.exercises.length} exercises
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleDelete} aria-label="Delete workout log">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {log.rating && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Rating:</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < log.rating!
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-zinc-200 dark:text-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {log.exercises.map((ex, i) => (
          <div
            key={i}
            className={`rounded-lg border p-4 ${
              ex.completed
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-950 dark:text-zinc-100">
                  {i + 1}. {ex.exerciseId.name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {ex.exerciseId.category}
                </Badge>
              </div>
              {ex.completed && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Completed
                </span>
              )}
            </div>

            <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <span>Sets: {ex.setsCompleted}</span>
              <span>
                Reps: {ex.repsCompleted.join(", ")}
              </span>
              {ex.weight !== undefined && <span>Weight: {ex.weight} kg</span>}
            </div>
          </div>
        ))}
      </div>

      {log.notes && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <h3 className="text-sm font-medium text-zinc-500 mb-1">Notes</h3>
          <p className="text-zinc-700 dark:text-zinc-300">{log.notes}</p>
        </div>
      )}
    </div>
  )
}
