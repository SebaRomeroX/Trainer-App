"use client"

import { Users, Dumbbell, TrendingUp, Star } from "lucide-react"

interface StatsOverviewProps {
  stats: {
    totalClients: number
    activeRoutines: number
    workoutsThisWeek: number
    avgRating: number
  } | null
  isLoading: boolean
}

const statCards = [
  {
    key: "totalClients",
    label: "Total Clients",
    icon: Users,
    format: (v: number) => v.toString(),
  },
  {
    key: "activeRoutines",
    label: "Active Routines",
    icon: Dumbbell,
    format: (v: number) => v.toString(),
  },
  {
    key: "workoutsThisWeek",
    label: "Workouts This Week",
    icon: TrendingUp,
    format: (v: number) => v.toString(),
  },
  {
    key: "avgRating",
    label: "Avg Rating",
    icon: Star,
    format: (v: number) => (v > 0 ? `${v} / 5` : "—"),
  },
] as const

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <div
          key={card.key}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6"
        >
          <div className="flex items-center gap-2">
            <card.icon className="size-5 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-500">{card.label}</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-100">
            {isLoading ? "—" : card.format(stats?.[card.key] ?? 0)}
          </p>
        </div>
      ))}
    </div>
  )
}
