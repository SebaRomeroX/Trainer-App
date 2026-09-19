"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useRouter, useParams } from "next/navigation"
import { RoutineForm } from "@/components/routines/routine-form"
import { RoutineChangeLog } from "@/components/routines/routine-change-log"
import type { CreateRoutineInput } from "@/validators/routine"
import type { RoutineExerciseInput } from "@/validators/routine"
import { useRoutine } from "@/hooks/use-routines"

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

function mapRoutine(apiRoutine: { name: string; description?: string; difficulty: string; duration: number; exercises: ApiExercise[]; isTemplate: boolean }): RoutineData {
  return {
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
}

export default function EditRoutinePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { routine: apiRoutine, isLoading } = useRoutine(id)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const routine = apiRoutine ? mapRoutine(apiRoutine) : null

  const handleSubmit = async (data: CreateRoutineInput) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/routines/${id}`, {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
            Edit Routine
          </h1>
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!routine) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
            Edit Routine
          </h1>
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            Routine not found.
          </p>
        </div>
      </div>
    )
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
        <RoutineChangeLog routineId={id} />
      </div>
    </div>
  )
}
