"use client"

import { Star } from "lucide-react"

interface Activity {
  workoutLogId: string
  clientName: string
  routineName: string
  date: string
  duration: number
  rating?: number
  exercisesCompleted: number
  totalExercises: number
}

interface RecentActivityProps {
  activities: Activity[]
  isLoading: boolean
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
      <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-4">
        Recent Activity
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          No recent workouts from your clients.
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.workoutLogId}
              className="flex items-center justify-between gap-4 rounded-md px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-950 dark:text-zinc-100 truncate">
                  <span className="font-medium">{activity.clientName}</span>
                  {" completed "}
                  <span className="font-medium">{activity.routineName}</span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activity.duration > 0 ? `${activity.duration} min` : ""}
                  {activity.duration > 0 && activity.exercisesCompleted > 0 ? " · " : ""}
                  {activity.exercisesCompleted > 0
                    ? `${activity.exercisesCompleted}/${activity.totalExercises} exercises`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activity.rating != null && activity.rating > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-zinc-500">
                    <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                    {activity.rating}
                  </div>
                )}
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formatDate(activity.date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
