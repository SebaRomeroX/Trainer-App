"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react"

interface RoutineExerciseRowProps {
  exerciseName: string
  index: number
  total: number
  data: {
    sets?: number
    reps?: number
    duration?: number
    restTime: number
    notes?: string
  }
  onChange: (index: number, field: string, value: number | string) => void
  onRemove: (index: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}

export function RoutineExerciseRow({
  exerciseName,
  index,
  total,
  data,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: RoutineExerciseRowProps) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-950 dark:text-zinc-100">
            {index + 1}. {exerciseName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs">Sets</Label>
          <Input
            type="number"
            min={1}
            value={data.sets ?? ""}
            onChange={(e) =>
              onChange(index, "sets", e.target.value ? Number(e.target.value) : 0)
            }
            placeholder="—"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Reps</Label>
          <Input
            type="number"
            min={1}
            value={data.reps ?? ""}
            onChange={(e) =>
              onChange(index, "reps", e.target.value ? Number(e.target.value) : 0)
            }
            placeholder="—"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Duration (sec)</Label>
          <Input
            type="number"
            min={1}
            value={data.duration ?? ""}
            onChange={(e) =>
              onChange(
                index,
                "duration",
                e.target.value ? Number(e.target.value) : 0
              )
            }
            placeholder="—"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Rest (sec)</Label>
          <Input
            type="number"
            min={0}
            value={data.restTime}
            onChange={(e) =>
              onChange(index, "restTime", Number(e.target.value))
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Notes</Label>
        <Textarea
          rows={1}
          value={data.notes ?? ""}
          onChange={(e) => onChange(index, "notes", e.target.value)}
          placeholder="Optional notes..."
        />
      </div>
    </div>
  )
}
