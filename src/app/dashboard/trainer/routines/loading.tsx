import { Skeleton } from "@/components/ui/skeleton"

export default function RoutinesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-zinc-200 dark:border-zinc-800 last:border-0 p-4"
          >
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
