"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/workouts/stats-cards"
import { WeeklyChart } from "@/components/workouts/weekly-chart"
import { RatingsChart } from "@/components/charts/ratings-chart"
import { Loader2 } from "lucide-react"

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
  const [stats, setStats] = useState<StatsData | null>(null)
  const [weekData, setWeekData] = useState<WeekDay[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const [statsRes, logsRes] = await Promise.all([
          fetch("/api/workout-logs/stats"),
          fetch("/api/workout-logs?limit=100"),
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          if (!cancelled) {
            setStats({
              totalWorkouts: data.totalWorkouts,
              workoutsThisWeek: data.workoutsThisWeek,
              averageRating: data.averageRating,
              currentStreak: data.currentStreak,
            })
          }
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json()
          if (!cancelled) {
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            const now = new Date()
            const startOfWeek = new Date(now)
            startOfWeek.setDate(now.getDate() - now.getDay())
            startOfWeek.setHours(0, 0, 0, 0)

            const counts = new Array(7).fill(0)
            for (const log of logsData.logs) {
              const logDate = new Date(log.date)
              if (logDate >= startOfWeek) {
                counts[logDate.getDay()]++
              }
            }

            setWeekData(
              dayNames.map((label, i) => ({ label, count: counts[i] }))
            )
          }
        }
      } catch (error) {
        console.error("Failed to load progress:", error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

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
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            No data yet. Complete your first workout to see your progress.
          </p>
        </div>
      )}
    </div>
  )
}
