"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { RoutineForm } from "@/components/routines/routine-form"
import { RoutineChangeLog } from "@/components/routines/routine-change-log"
import type { CreateRoutineInput, RoutineExerciseInput } from "@/validators/routine"

interface RoutineData {
  name: string
  description?: string
  difficulty: string
  duration: number
  exercises: RoutineExerciseInput[]
  isTemplate: boolean
}

interface ApiExercise {
  exerciseId: string | { _id: string }
  sets?: number
  reps?: number
  duration?: number
  restTime?: number
  notes?: string
  order?: number
}

export function RoutineEditClient({
  routineId,
  routine: apiRoutine,
}: {
  routineId: string
  routine: { name: string; description?: string; difficulty: string; duration: number; exercises: ApiExercise[]; isTemplate: boolean }
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const routine: RoutineData = {
    name: apiRoutine.name,
    description: apiRoutine.description,
    difficulty: apiRoutine.difficulty,
    duration: apiRoutine.duration,
    exercises: apiRoutine.exercises.map((ex) => ({
      exerciseId:
        typeof ex.exerciseId === "object"
          ? ex.exerciseId._id
          : ex.exerciseId,
      sets: ex.sets,
      reps: ex.reps,
      duration: ex.duration,
      restTime: ex.restTime ?? 60,
      notes: ex.notes,
      order: ex.order ?? 0,
    })),
    isTemplate: apiRoutine.isTemplate,
  }

  const handleSubmit = async (data: CreateRoutineInput) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/routines/${routineId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push("/dashboard/trainer/routines")
      } else {
        toast.error("Failed to update routine")
      }
    } catch {
      toast.error("Failed to update routine")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
          Edit Routine
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Update your workout routine.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <RoutineForm
          routine={routine}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/trainer/routines")}
          isLoading={isSubmitting}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
          Change History
        </h2>
        <RoutineChangeLog routineId={routineId} />
      </div>
    </div>
  )
}
