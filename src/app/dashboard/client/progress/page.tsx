"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { StatsCards } from "@/components/workouts/stats-cards"
import { WeeklyChart } from "@/components/workouts/weekly-chart"
import { RatingsChart } from "@/components/charts/ratings-chart"
import { EmptyState } from "@/components/shared/empty-state"
import { Loader2, TrendingUp } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface StatsData {
  totalWorkouts: number
  workoutsThisWeek: number
  averageRating: number
  currentStreak: number
}

interface WeekDay {
  label: string
  count: number
}

export default function ProgressPage() {
  const [weekData, setWeekData] = useState<WeekDay[]>([])

  const statsRes = useSWR<StatsData>(
    "/api/workout-logs/stats",
    fetcher,
    { dedupingInterval: 30000 }
  )
  const logsRes = useSWR<{ logs: Array<{ date: string }> }>(
    "/api/workout-logs?limit=100",
    fetcher,
    { dedupingInterval: 30000 }
  )

  const stats = statsRes.data ?? null
  const isLoading = statsRes.isLoading || logsRes.isLoading

  useEffect(() => {
    if (!logsRes.data?.logs) return

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const counts = new Array(7).fill(0)
    for (const log of logsRes.data.logs) {
      const logDate = new Date(log.date)
      if (logDate >= startOfWeek) {
        counts[logDate.getDay()]++
      }
    }

    setWeekData(
      dayNames.map((label, i) => ({ label, count: counts[i] }))
    )
  }, [logsRes.data])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
          Progress
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Track your fitness journey over time.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : stats || weekData.length > 0 ? (
        <>
          {stats && <StatsCards stats={stats} />}
          <WeeklyChart data={weekData} />
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
              Ratings Over Time
            </h2>
            <RatingsChart useSelf />
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <EmptyState
            icon={TrendingUp}
            title="No data yet"
            description="Complete your first workout to see your progress."
          />
        </div>
      )}
    </div>
  )
}
