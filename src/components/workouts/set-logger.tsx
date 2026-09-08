"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2 } from "lucide-react"

interface ExerciseData {
  name: string
  category: string
  targetSets?: number
  targetReps?: number
  routineNotes?: string
}

interface SetLoggerProps {
  index: number
  exercise: ExerciseData
  data: {
    setsCompleted: number
    repsCompleted: number[]
    weight?: number
    duration?: number
    completed: boolean
    notes: string
  }
  onChange: (index: number, field: string, value: unknown) => void
}

export function SetLogger({
  index,
  exercise,
  data,
  onChange,
}: SetLoggerProps) {
  const targetSets = exercise.targetSets || 1

  const handleSetReps = (setIndex: number, value: string) => {
    const reps = [...data.repsCompleted]
    const parsed = Number(value)
    reps[setIndex] = value !== "" && !isNaN(parsed) && parsed >= 0 ? parsed : 0
    onChange(index, "repsCompleted", reps)
    onChange(index, "setsCompleted", reps.filter((r) => r > 0).length)
  }

  const handleToggleCompleted = (checked: boolean) => {
    onChange(index, "completed", !!checked)
    if (checked) {
      onChange(index, "setsCompleted", targetSets)
    } else {
      onChange(
        index,
        "setsCompleted",
        data.repsCompleted.filter((r) => r > 0).length
      )
    }
  }

  const isTimeBased = exercise.category === "stretching" || exercise.category === "cardio"

  return (
    <div
      className={`rounded-lg border p-4 space-y-3 transition-colors ${
        data.completed
          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-950 dark:text-zinc-100">
            {index + 1}. {exercise.name}
          </span>
          {data.completed && (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`completed-${index}`} className="text-xs text-zinc-500">
            Done
          </Label>
          <Checkbox
            id={`completed-${index}`}
            checked={data.completed}
            onCheckedChange={handleToggleCompleted}
          />
        </div>
      </div>

      {exercise.routineNotes && (
        <p className="text-xs text-zinc-500 italic">
          Note: {exercise.routineNotes}
        </p>
      )}

      {exercise.targetSets && exercise.targetReps && (
        <p className="text-xs text-zinc-500">
          Target: {exercise.targetSets} sets × {exercise.targetReps} reps
        </p>
      )}

      {isTimeBased ? (
        <div className="space-y-1">
          <Label className="text-xs">Duration (seconds)</Label>
          <Input
            type="number"
            min={0}
            className="w-24"
            value={data.duration ?? ""}
            onChange={(e) => {
              const parsed = Number(e.target.value)
              onChange(
                index,
                "duration",
                e.target.value !== "" && !isNaN(parsed) && parsed >= 0
                  ? parsed
                  : undefined
              )
            }}
            placeholder="0"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-xs">Reps per set</Label>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: targetSets }).map((_, setIndex) => (
              <div key={setIndex} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-zinc-400">Set {setIndex + 1}</span>
                <Input
                  type="number"
                  min={0}
                  className="w-16 text-center"
                  value={data.repsCompleted[setIndex] ?? ""}
                  onChange={(e) => handleSetReps(setIndex, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Weight (kg)</Label>
          <Input
            type="number"
            min={0}
            step={0.5}
            value={data.weight ?? ""}
            onChange={(e) => {
              const parsed = Number(e.target.value)
              onChange(
                index,
                "weight",
                e.target.value !== "" && !isNaN(parsed) && parsed >= 0
                  ? parsed
                  : undefined
              )
            }}
            placeholder="—"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Notes</Label>
        <Textarea
          rows={1}
          value={data.notes}
          onChange={(e) => onChange(index, "notes", e.target.value)}
          placeholder="Optional notes..."
        />
      </div>
    </div>
  )
}
