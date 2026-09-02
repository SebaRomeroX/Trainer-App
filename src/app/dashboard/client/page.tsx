import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Client Dashboard | Body Trainer App",
}

export default function ClientDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
        My Workouts
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        View your assigned routines and track your progress.
      </p>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <h3 className="text-sm font-medium text-zinc-500">Active Routine</h3>
        <p className="mt-2 text-zinc-950 dark:text-zinc-100">
          No active routine assigned yet.
        </p>
      </div>
    </div>
  )
}
