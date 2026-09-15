export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-48 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-48 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
    </div>
  )
}
