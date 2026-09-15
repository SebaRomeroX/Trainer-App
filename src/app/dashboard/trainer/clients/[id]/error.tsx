"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function ClientDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Something went wrong
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Failed to load client details. Please try again.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard/trainer/clients"
          className="inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          All clients
        </Link>
      </div>
    </div>
  )
}
