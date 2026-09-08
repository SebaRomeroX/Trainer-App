"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Flame } from "lucide-react"

interface ClientData {
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
}

interface ClientProgressCardsProps {
  clients: ClientData[]
  isLoading: boolean
}

const fitnessLevelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

function ClientInitial({ name }: { name: string }) {
  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function ClientProgressCards({ clients, isLoading }: ClientProgressCardsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-4">
        Client Progress
      </h2>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-lg bg-zinc-100 dark:bg-zinc-900 animate-pulse"
            />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          No clients yet. Add clients to see their progress here.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.clientId}
              href={`/dashboard/trainer/clients/${client.clientId}`}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors space-y-3"
            >
              <div className="flex items-center gap-3">
                <ClientInitial name={client.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-950 dark:text-zinc-100 truncate">
                    {client.name}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-xs ${fitnessLevelColors[client.fitnessLevel] ?? ""}`}
                  >
                    {client.fitnessLevel}
                  </Badge>
                </div>
                {client.streak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 shrink-0">
                    <Flame className="size-3.5" />
                    {client.streak}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Progress value={client.completionRate}>
                  <ProgressLabel>Completion</ProgressLabel>
                  <ProgressValue />
                </Progress>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{client.workoutsThisWeek} workouts this week</span>
                <span>{client.totalWorkouts} total</span>
              </div>

              {client.activeRoutineName && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  Active: {client.activeRoutineName}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
