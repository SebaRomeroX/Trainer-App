"use client"

import { StatsOverview } from "@/components/dashboard/stats-overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { ClientProgressCards } from "@/components/dashboard/client-progress-cards"
import { useDashboard } from "@/hooks/use-dashboard"

export default function TrainerDashboardPage() {
  const { data, isLoading } = useDashboard()

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
