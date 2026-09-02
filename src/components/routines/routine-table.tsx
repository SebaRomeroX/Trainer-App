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
import { Pencil, Trash2, Clock, Dumbbell } from "lucide-react"

interface RoutineRow {
  _id: string
  name: string
  difficulty: string
  duration: number
  exercises: { exerciseId: string }[]
  isTemplate: boolean
}

interface RoutineTableProps {
  routines: RoutineRow[]
  onEdit: (routine: RoutineRow) => void
  onDelete: (routine: RoutineRow) => void
}

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function RoutineTable({
  routines,
  onEdit,
  onDelete,
}: RoutineTableProps) {
  if (routines.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          No routines found. Create your first routine to get started.
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
            <TableHead>Difficulty</TableHead>
            <TableHead>Exercises</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Template</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routines.map((routine) => (
            <TableRow key={routine._id}>
              <TableCell className="font-medium">{routine.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={difficultyColors[routine.difficulty]}
                >
                  {routine.difficulty}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                  <Dumbbell className="h-3.5 w-3.5" />
                  {routine.exercises.length}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                  <Clock className="h-3.5 w-3.5" />
                  {routine.duration} min
                </span>
              </TableCell>
              <TableCell>
                {routine.isTemplate ? (
                  <Badge variant="secondary">Template</Badge>
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(routine)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(routine)}
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
