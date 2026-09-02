"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CreateExerciseSchema,
  type CreateExerciseInput,
} from "@/validators/exercise"
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

interface ExerciseData {
  name: string
  description?: string
  category: string
  muscleGroups: string[]
  equipment: string[]
  difficulty: string
}

interface ExerciseFormProps {
  exercise?: ExerciseData
  onSubmit: (data: CreateExerciseInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ExerciseForm({
  exercise,
  onSubmit,
  onCancel,
  isLoading,
}: ExerciseFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateExerciseSchema),
    defaultValues: {
      name: exercise?.name ?? "",
      description: exercise?.description ?? "",
      category: (exercise?.category ?? "strength") as "strength" | "cardio" | "flexibility" | "balance" | "other",
      muscleGroups: exercise?.muscleGroups ?? [],
      equipment: exercise?.equipment ?? [],
      difficulty: (exercise?.difficulty ?? "medium") as "easy" | "medium" | "hard",
    },
  })

  const category = watch("category")
  const difficulty = watch("difficulty")

  const handleArrayInput = (
    field: "muscleGroups" | "equipment",
    value: string
  ) => {
    const items = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    setValue(field, items, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g. Bench Press"
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
          <Label>Category</Label>
          <Select
            value={category}
            onValueChange={(val) =>
              setValue("category", val as CreateExerciseInput["category"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="flexibility">Flexibility</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(val) =>
              setValue("difficulty", val as CreateExerciseInput["difficulty"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="muscleGroups">Muscle Groups</Label>
        <Input
          id="muscleGroups"
          placeholder="e.g. Chest, Triceps, Shoulders"
          defaultValue={exercise?.muscleGroups?.join(", ") ?? ""}
          onBlur={(e) => handleArrayInput("muscleGroups", e.target.value)}
        />
        <p className="text-xs text-zinc-500">Comma-separated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="equipment">Equipment</Label>
        <Input
          id="equipment"
          placeholder="e.g. Barbell, Bench"
          defaultValue={exercise?.equipment?.join(", ") ?? ""}
          onBlur={(e) => handleArrayInput("equipment", e.target.value)}
        />
        <p className="text-xs text-zinc-500">Comma-separated</p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : exercise ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}
