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
import { Star, Eye, History } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/shared/empty-state"

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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-zinc-200 dark:text-zinc-700"
          }`}
        />
      ))}
    </div>
  )
}

export function WorkoutHistoryTable({ logs }: WorkoutHistoryTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <EmptyState
          icon={History}
          title="No workouts yet"
          description="Start your first workout to see your history here."
        />
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-x-auto">
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
                        className={difficultyColors[log.routineId.difficulty] ?? "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"}
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
                      <StarRating rating={log.rating} />
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

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {logs.map((log) => {
          const completed = log.exercises.filter((e) => e.completed).length
          return (
            <Link
              key={log._id}
              href={`/dashboard/client/history/${log._id}`}
              className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <p className="font-medium text-zinc-950 dark:text-zinc-100 truncate">
                    {log.routineId.name}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {new Date(log.date).toLocaleDateString()} · {log.duration} min
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 ml-2 ${difficultyColors[log.routineId.difficulty] ?? ""}`}
                >
                  {log.routineId.difficulty}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  {log.rating ? (
                    <StarRating rating={log.rating} />
                  ) : (
                    <span className="text-zinc-400">No rating</span>
                  )}
                  <span className="text-zinc-500">
                    {completed}/{log.exercises.length} exercises
                  </span>
                </div>
                <Eye className="h-4 w-4 text-zinc-400" />
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
