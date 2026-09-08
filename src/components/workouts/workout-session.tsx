"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SetLogger } from "@/components/workouts/set-logger"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"

interface ExerciseInfo {
  _id: string
  name: string
  category: string
}

interface RoutineExercise {
  exerciseId: ExerciseInfo
  sets?: number
  reps?: number
  duration?: number
  restTime: number
  notes?: string
  order: number
}

interface AssignmentData {
  _id: string
  routineId: {
    _id: string
    name: string
    description?: string
    difficulty: string
    duration: number
    exercises: RoutineExercise[]
  }
  status: string
}

interface ExerciseLog {
  setsCompleted: number
  repsCompleted: number[]
  weight?: number
  duration?: number
  completed: boolean
  notes: string
}

interface WorkoutSessionProps {
  assignmentId: string
}

export function WorkoutSession({ assignmentId }: WorkoutSessionProps) {
  const router = useRouter()
  const [assignment, setAssignment] = useState<AssignmentData | null>(null)
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([])
  const [overallNotes, setOverallNotes] = useState("")
  const [rating, setRating] = useState<number | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startTime] = useState(() => Date.now())

  useEffect(() => {
    const controller = new AbortController()
    async function fetchAssignment() {
      try {
        const res = await fetch(`/api/client-routines/${assignmentId}/details`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error("Failed to load assignment")
        const data = await res.json()
        setAssignment(data.assignment)

        const exercises = data.assignment.routineId.exercises
        setExerciseLogs(
          exercises.map((_: RoutineExercise) => ({
            setsCompleted: 0,
            repsCompleted: Array.from({ length: _.sets || 1 }).map(() => 0),
            weight: undefined,
            duration: undefined,
            completed: false,
            notes: "",
          }))
        )
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        setError("Failed to load workout. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAssignment()
    return () => controller.abort()
  }, [assignmentId])

  const handleExerciseChange = (
    index: number,
    field: string,
    value: unknown
  ) => {
    setExerciseLogs((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const completedCount = exerciseLogs.filter((e) => e.completed).length
  const totalCount = exerciseLogs.length

  const handleFinish = async () => {
    if (!assignment) return

    setError(null)
    setIsSaving(true)
    try {
      const duration = Math.round((Date.now() - startTime) / 60000)

      const exercises = assignment.routineId.exercises.map((ex, i) => ({
        exerciseId: ex.exerciseId._id,
        setsCompleted: exerciseLogs[i].setsCompleted,
        repsCompleted: exerciseLogs[i].repsCompleted,
        weight: exerciseLogs[i].weight,
        duration: exerciseLogs[i].duration,
        completed: exerciseLogs[i].completed,
        notes: exerciseLogs[i].notes || undefined,
      }))

      const res = await fetch("/api/workout-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineId: assignment.routineId._id,
          exercises,
          notes: overallNotes || undefined,
          duration,
          rating,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save workout")
      }

      router.push("/dashboard/client/history")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save workout")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/client"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
          <p className="text-red-600 dark:text-red-400">
            {error || "Assignment not found."}
          </p>
        </div>
      </div>
    )
  }

  const routine = assignment.routineId

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <Link
          href="/dashboard/client"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
          {routine.name}
        </h1>
        <p className="text-sm text-zinc-500">
          {routine.exercises.length} exercises &middot; ~{routine.duration} min
        </p>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-zinc-500">
          {completedCount}/{totalCount} completed
        </span>
        <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {routine.exercises.map((ex, i) => (
          <SetLogger
            key={`${ex.exerciseId._id}-${i}`}
            index={i}
            exercise={{
              name: ex.exerciseId.name,
              category: ex.exerciseId.category,
              targetSets: ex.sets,
              targetReps: ex.reps,
              routineNotes: ex.notes,
            }}
            data={exerciseLogs[i]}
            onChange={handleExerciseChange}
          />
        ))}
      </div>

      <div className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Overall Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value === rating ? undefined : value)}
                className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                  rating === value
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-medium">Workout Notes</Label>
          <Textarea
            rows={2}
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            placeholder="How did it go?"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Button
        onClick={handleFinish}
        disabled={isSaving || completedCount === 0}
        className="w-full"
        size="lg"
      >
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Finish Workout
      </Button>
    </div>
  )
}
