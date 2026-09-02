"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CreateRoutineSchema,
  type CreateRoutineInput,
} from "@/validators/routine"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RoutineExerciseBuilder } from "./routine-exercise-builder"
import type { RoutineExerciseInput } from "@/validators/routine"

interface RoutineData {
  name: string
  description?: string
  difficulty: string
  duration: number
  exercises: RoutineExerciseInput[]
  isTemplate: boolean
}

interface RoutineFormProps {
  routine?: RoutineData
  onSubmit: (data: CreateRoutineInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function RoutineForm({
  routine,
  onSubmit,
  onCancel,
  isLoading,
}: RoutineFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateRoutineSchema),
    defaultValues: {
      name: routine?.name ?? "",
      description: routine?.description ?? "",
      difficulty: (routine?.difficulty ?? "beginner") as
        | "beginner"
        | "intermediate"
        | "advanced",
      duration: routine?.duration ?? 30,
      exercises: routine?.exercises ?? [],
      isTemplate: routine?.isTemplate ?? false,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g. Upper Body Strength"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional description..."
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={1}
            {...register("duration", { valueAsNumber: true })}
          />
          {errors.duration && (
            <p className="text-sm text-red-500">{errors.duration.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Exercises</Label>
        <Controller
          name="exercises"
          control={control}
          render={({ field }) => (
            <RoutineExerciseBuilder
              exercises={(field.value ?? []) as RoutineExerciseInput[]}
              onChange={field.onChange}
              errors={errors.exercises?.message}
            />
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isTemplate"
          className="h-4 w-4 rounded border-zinc-300"
          {...register("isTemplate")}
        />
        <Label htmlFor="isTemplate" className="text-sm font-normal">
          Save as template
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : routine ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}
