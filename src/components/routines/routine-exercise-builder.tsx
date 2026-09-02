"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { RoutineExerciseRow } from "./routine-exercise-row"
import type { RoutineExerciseInput } from "@/validators/routine"

interface Exercise {
  _id: string
  name: string
  category: string
  difficulty: string
}

interface RoutineExerciseBuilderProps {
  exercises: RoutineExerciseInput[]
  onChange: (exercises: RoutineExerciseInput[]) => void
  errors?: string
}

export function RoutineExerciseBuilder({
  exercises,
  onChange,
  errors,
}: RoutineExerciseBuilderProps) {
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("")

  useEffect(() => {
    fetch("/api/exercises")
      .then((res) => res.json())
      .then((data) => setAvailableExercises(data.exercises ?? []))
      .catch(() => {})
  }, [])

  const exercisesWithNames = exercises.map((ex) => {
    const found = availableExercises.find((e) => e._id === ex.exerciseId)
    return { ...ex, name: found?.name ?? "Unknown Exercise" }
  })

  const handleAddExercise = () => {
    if (!selectedExerciseId) return

    const newExercise: RoutineExerciseInput = {
      exerciseId: selectedExerciseId,
      restTime: 60,
      order: exercises.length,
    }

    onChange([...exercises, newExercise])
    setSelectedExerciseId("")
  }

  const handleChange = (
    index: number,
    field: string,
    value: number | string
  ) => {
    const updated = exercises.map((ex, i) =>
      i === index ? { ...ex, [field]: value } : ex
    )
    onChange(updated)
  }

  const handleRemove = (index: number) => {
    const updated = exercises
      .filter((_, i) => i !== index)
      .map((ex, i) => ({ ...ex, order: i }))
    onChange(updated)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...exercises]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onChange(updated.map((ex, i) => ({ ...ex, order: i })))
  }

  const handleMoveDown = (index: number) => {
    if (index === exercises.length - 1) return
    const updated = [...exercises]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onChange(updated.map((ex, i) => ({ ...ex, order: i })))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Select
            value={selectedExerciseId}
            onValueChange={(val) => setSelectedExerciseId(val ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {availableExercises.map((exercise) => (
                <SelectItem key={exercise._id} value={exercise._id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddExercise}
          disabled={!selectedExerciseId}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {exercises.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
          No exercises added yet. Select an exercise above to add it to the
          routine.
        </p>
      )}

      <div className="space-y-3">
        {exercisesWithNames.map((exercise, index) => (
          <RoutineExerciseRow
            key={`${exercise.exerciseId}-${index}`}
            exerciseName={exercise.name}
            index={index}
            total={exercises.length}
            data={exercise}
            onChange={handleChange}
            onRemove={handleRemove}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ))}
      </div>

      {errors && <p className="text-sm text-red-500">{errors}</p>}
    </div>
  )
}
