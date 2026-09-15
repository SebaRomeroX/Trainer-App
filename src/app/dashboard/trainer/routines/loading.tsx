export default function RoutinesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-4 w-64 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 border-b border-zinc-200 dark:border-zinc-800 last:border-0 bg-zinc-50 dark:bg-zinc-900 animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
