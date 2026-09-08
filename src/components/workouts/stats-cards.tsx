"use client"

import { Flame, Calendar, TrendingUp, Star } from "lucide-react"

interface StatsData {
  totalWorkouts: number
  workoutsThisWeek: number
  averageRating: number
  currentStreak: number
}

interface StatsCardsProps {
  stats: StatsData
}

const cards = [
  {
    key: "totalWorkouts",
    label: "Total Workouts",
    icon: TrendingUp,
    format: (v: number) => v.toString(),
  },
  {
    key: "workoutsThisWeek",
    label: "This Week",
    icon: Calendar,
    format: (v: number) => v.toString(),
  },
  {
    key: "currentStreak",
    label: "Current Streak",
    icon: Flame,
    format: (v: number) => (v > 0 ? `${v} day${v === 1 ? "" : "s"}` : "None"),
  },
  {
    key: "averageRating",
    label: "Avg Rating",
    icon: Star,
    format: (v: number) => (v > 0 ? `${v}/5` : "—"),
  },
] as const

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5"
        >
          <div className="flex items-center gap-2">
            <card.icon className="size-4 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-500">{card.label}</h3>
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-100">
            {card.format(stats[card.key])}
          </p>
        </div>
      ))}
    </div>
  )
}
