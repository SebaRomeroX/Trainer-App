"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"

interface ExerciseRow {
  _id: string
  name: string
  category: string
  muscleGroups: string[]
  equipment: string[]
  difficulty: string
}

interface ExerciseTableProps {
  exercises: ExerciseRow[]
  onEdit: (exercise: ExerciseRow) => void
  onDelete: (exercise: ExerciseRow) => void
}

const categoryColors: Record<string, string> = {
  strength: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  cardio: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  flexibility:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  balance:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  other: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function ExerciseTable({
  exercises,
  onEdit,
  onDelete,
}: ExerciseTableProps) {
  if (exercises.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          No exercises found. Create your first exercise to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Muscle Groups</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exercises.map((exercise) => (
            <TableRow key={exercise._id}>
              <TableCell className="font-medium">{exercise.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={categoryColors[exercise.category]}
                >
                  {exercise.category}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {exercise.muscleGroups?.join(", ") || "—"}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={difficultyColors[exercise.difficulty]}
                >
                  {exercise.difficulty}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(exercise)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(exercise)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
