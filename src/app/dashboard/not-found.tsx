"use client"

import Link from "next/link"

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Page not found
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        Go to dashboard
      </Link>
    </div>
  )
}
