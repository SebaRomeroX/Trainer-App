"use client"

import { useState } from "react"
import { WorkoutHistoryTable } from "@/components/workouts/workout-history-table"
import { Loader2 } from "lucide-react"
import { useWorkoutLogs } from "@/hooks/use-workout-logs"

export default function WorkoutHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { logs, pagination, isLoading } = useWorkoutLogs(currentPage, 15)

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
