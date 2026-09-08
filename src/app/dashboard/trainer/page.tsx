"use client"

import { useState, useEffect } from "react"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { ClientProgressCards } from "@/components/dashboard/client-progress-cards"

interface DashboardData {
  stats: {
    totalClients: number
    activeRoutines: number
    workoutsThisWeek: number
    avgRating: number
  }
  clients: Array<{
    clientId: string
    name: string
    avatar?: string
    fitnessLevel: string
    workoutsThisWeek: number
    totalWorkouts: number
    streak: number
    activeRoutineName: string | null
    completionRate: number
    lastWorkoutDate: string | null
  }>
  recentActivity: Array<{
    workoutLogId: string
    clientName: string
    routineName: string
    date: string
    duration: number
    rating?: number
    exercisesCompleted: number
    totalExercises: number
  }>
}

export default function TrainerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/trainer/dashboard")
        if (!cancelled && res.ok) {
          const json = await res.json()
          setData(json)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchDashboard()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
          Trainer Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Welcome back. Manage your clients and routines from here.
        </p>
      </div>

      <StatsOverview stats={data?.stats ?? null} isLoading={isLoading} />

      <RecentActivity activities={data?.recentActivity ?? []} isLoading={isLoading} />

      <ClientProgressCards clients={data?.clients ?? []} isLoading={isLoading} />
    </div>
  )
}
