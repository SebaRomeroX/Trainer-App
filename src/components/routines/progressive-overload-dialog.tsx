"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"

interface Exercise {
  _id: string
  name: string
  category: string
}

interface PlanExercise {
  exerciseId: string
  targetWeight?: number
  targetReps?: number
  targetSets?: number
  targetDate: string
  notes?: string
}

interface PlanData {
  _id: string
  clientRoutineId: string
  exercises: {
    exerciseId: { _id: string; name: string; category?: string } | string
    targetWeight?: number
    targetReps?: number
    targetSets?: number
    targetDate: string
    notes?: string
  }[]
  status: string
}

interface ProgressiveOverloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientRoutineId: string
  routineExerciseIds: string[]
  existingPlan: PlanData | null
  onSaved: () => void
}

export function ProgressiveOverloadDialog({
  open,
  onOpenChange,
  clientRoutineId,
  routineExerciseIds,
  existingPlan,
  onSaved,
}: ProgressiveOverloadDialogProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [targets, setTargets] = useState<PlanExercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    let cancelled = false

    async function load() {
      setIsFetching(true)
      try {
        const res = await fetch("/api/exercises")
        if (!cancelled && res.ok) {
          const data = await res.json()
          const routineExercises = data.exercises.filter((e: Exercise) =>
            routineExerciseIds.includes(e._id)
          )
          setExercises(routineExercises)

          if (existingPlan) {
            setTargets(
              existingPlan.exercises.map((e) => {
                const exId =
                  typeof e.exerciseId === "object" && e.exerciseId !== null
                    ? e.exerciseId._id
                    : (e.exerciseId as string)
                return {
                  exerciseId: exId,
                  targetWeight: e.targetWeight,
                  targetReps: e.targetReps,
                  targetSets: e.targetSets,
                  targetDate: e.targetDate
                    ? new Date(e.targetDate).toISOString().split("T")[0]
                    : "",
                  notes: e.notes,
                }
              })
            )
          } else {
            setTargets(
              routineExercises.map((e: Exercise) => ({
                exerciseId: e._id,
                targetWeight: undefined,
                targetReps: undefined,
                targetSets: undefined,
                targetDate: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                )
                  .toISOString()
                  .split("T")[0],
                notes: "",
              }))
            )
          }
        }
      } catch {
        if (!cancelled) setError("Failed to load exercises.")
      } finally {
        if (!cancelled) setIsFetching(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [open, existingPlan, routineExerciseIds])

  function handleClose() {
    setTargets([])
    setError("")
    onOpenChange(false)
  }

  function handleSavedClose() {
    setTargets([])
    setError("")
    onSaved()
    onOpenChange(false)
  }

  function updateTarget(
    index: number,
    field: keyof PlanExercise,
    value: string | number | undefined
  ) {
    setTargets((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    )
  }

  function removeTarget(index: number) {
    setTargets((prev) => prev.filter((_, i) => i !== index))
  }

  function addTarget() {
    const usedIds = targets.map((t) => t.exerciseId)
    const available = exercises.find((e) => !usedIds.includes(e._id))
    if (!available) return

    setTargets((prev) => [
      ...prev,
      {
        exerciseId: available._id,
        targetWeight: undefined,
        targetReps: undefined,
        targetSets: undefined,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        notes: "",
      },
    ])
  }

  async function handleSave() {
    const validTargets = targets.filter(
      (t) =>
        t.targetWeight !== undefined ||
        t.targetReps !== undefined ||
        t.targetSets !== undefined
    )

    if (validTargets.length === 0) {
      setError("Set at least one target (weight, reps, or sets) for an exercise.")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const url = existingPlan
        ? `/api/progressive-overload/${existingPlan._id}`
        : "/api/progressive-overload"

      const method = existingPlan ? "PUT" : "POST"

      const body = existingPlan
        ? { exercises: validTargets }
        : { clientRoutineId, exercises: validTargets }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to save plan.")
        return
      }

      handleSavedClose()
    } catch {
      setError("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  function getExerciseName(id: string) {
    return exercises.find((e) => e._id === id)?.name || id
  }

  const usedExerciseIds = targets.map((t) => t.exerciseId)
  const canAddMore = exercises.some((e) => !usedExerciseIds.includes(e._id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingPlan ? "Edit Overload Plan" : "Create Overload Plan"}
          </DialogTitle>
          <DialogDescription>
            Set target weight, reps, and sets for each exercise with a target
            date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isFetching ? (
            <p className="text-sm text-zinc-500">Loading exercises...</p>
          ) : targets.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No exercises in this routine to set targets for.
            </p>
          ) : (
            targets.map((target, index) => (
              <div
                key={`${target.exerciseId}-${index}`}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-zinc-950 dark:text-zinc-100">
                    {getExerciseName(target.exerciseId)}
                  </p>
                  {targets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeTarget(index)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Target Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="--"
                      value={target.targetWeight ?? ""}
                      onChange={(e) =>
                        updateTarget(
                          index,
                          "targetWeight",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Target Reps</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="--"
                      value={target.targetReps ?? ""}
                      onChange={(e) =>
                        updateTarget(
                          index,
                          "targetReps",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Target Sets</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="--"
                      value={target.targetSets ?? ""}
                      onChange={(e) =>
                        updateTarget(
                          index,
                          "targetSets",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Target Date</Label>
                  <Input
                    type="date"
                    value={target.targetDate}
                    onChange={(e) =>
                      updateTarget(index, "targetDate", e.target.value)
                    }
                  />
                </div>
              </div>
            ))
          )}

          {canAddMore && !isFetching && (
            <Button
              variant="outline"
              size="sm"
              onClick={addTarget}
              className="w-full"
            >
              <Plus className="size-4" /> Add Exercise
            </Button>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isFetching}>
            {isLoading
              ? "Saving..."
              : existingPlan
                ? "Update Plan"
                : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
