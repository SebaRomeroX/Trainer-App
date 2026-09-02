import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Trainer Dashboard | Body Trainer App",
}

export default function TrainerDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
        Trainer Dashboard
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Welcome back. Manage your clients and routines from here.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
          <h3 className="text-sm font-medium text-zinc-500">Clients</h3>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-100">0</p>
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
          <h3 className="text-sm font-medium text-zinc-500">Routines</h3>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-100">0</p>
        </div>
        <Link
          href="/dashboard/trainer/exercises"
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <h3 className="text-sm font-medium text-zinc-500">Exercises</h3>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-100">0</p>
        </Link>
      </div>
    </div>
  )
}
