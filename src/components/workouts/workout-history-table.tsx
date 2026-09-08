"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Star, Eye } from "lucide-react"
import Link from "next/link"

interface RoutineInfo {
  _id: string
  name: string
  difficulty: string
}

interface WorkoutLog {
  _id: string
  routineId: RoutineInfo
  date: string
  duration: number
  rating?: number
  notes?: string
  exercises: {
    completed: boolean
  }[]
}

interface WorkoutHistoryTableProps {
  logs: WorkoutLog[]
}

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function WorkoutHistoryTable({ logs }: WorkoutHistoryTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          No workouts yet. Start your first workout to see your history here.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Routine</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Exercises</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const completed = log.exercises.filter((e) => e.completed).length
            return (
              <TableRow key={log._id}>
                <TableCell className="font-medium">
                  {new Date(log.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{log.routineId.name}</span>
                    <Badge
                      variant="outline"
                      className={difficultyColors[log.routineId.difficulty]}
                    >
                      {log.routineId.difficulty}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {log.duration} min
                  </span>
                </TableCell>
                <TableCell>
                  {log.rating ? (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < log.rating!
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-zinc-200 dark:text-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {completed}/{log.exercises.length}
                  </span>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/client/history/${log._id}`}
                    className="inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] hover:bg-muted hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
