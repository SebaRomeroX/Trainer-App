"use client"

import { useState, useEffect } from "react"
import { WorkoutHistoryTable } from "@/components/workouts/workout-history-table"
import { Loader2 } from "lucide-react"

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

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function WorkoutHistoryPage() {
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    async function fetchLogs() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/workout-logs?page=${currentPage}&limit=15`)
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) {
            setLogs(data.logs)
            setPagination(data.pagination)
          }
        }
      } catch (error) {
        console.error("Failed to load workout history:", error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchLogs()
    return () => { cancelled = true }
  }, [currentPage])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
          Workout History
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Review your past workouts and track your consistency.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : (
        <>
          <WorkoutHistoryTable logs={logs} />

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} workouts)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
                  className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
