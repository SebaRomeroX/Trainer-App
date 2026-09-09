"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Pencil,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
} from "lucide-react"

interface ChangeEntry {
  _id: string
  routineId: { _id: string; name: string } | string
  changeType: string
  description: string
  changes?: { field: string; before: unknown; after: unknown }[]
  createdAt: string
}

const changeTypeConfig: Record<
  string,
  { icon: typeof Pencil; color: string; label: string }
> = {
  routine_updated: {
    icon: Pencil,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
    label: "Updated",
  },
  assigned: {
    icon: UserPlus,
    color: "text-green-500 bg-green-50 dark:bg-green-950/30",
    label: "Assigned",
  },
  unassigned: {
    icon: UserMinus,
    color: "text-red-500 bg-red-50 dark:bg-red-950/30",
    label: "Unassigned",
  },
  status_changed: {
    icon: ArrowRightLeft,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
    label: "Status",
  },
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

interface RoutineChangeLogProps {
  routineId?: string
  clientId?: string
  showRoutineName?: boolean
}

export function RoutineChangeLog({
  routineId,
  clientId,
  showRoutineName = false,
}: RoutineChangeLogProps) {
  const [changes, setChanges] = useState<ChangeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const url = routineId
      ? `/api/routines/${routineId}/changes`
      : `/api/clients/${clientId}/routine-changes`

    async function load() {
      try {
        const res = await fetch(url)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setChanges(data.changes)
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [routineId, clientId])

  if (loading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Loading change history...
      </p>
    )
  }

  if (changes.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No changes recorded yet.
      </p>
    )
  }

  return (
    <div className="space-y-0">
      {changes.map((entry) => {
        const config =
          changeTypeConfig[entry.changeType] || changeTypeConfig.routine_updated
        const Icon = config.icon

        return (
          <div
            key={entry._id}
            className="flex items-start gap-3 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
          >
            <div
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                config.color
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {entry.description}
              </p>
              {showRoutineName &&
                typeof entry.routineId === "object" &&
                entry.routineId?.name && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Routine: {entry.routineId.name}
                  </p>
                )}
              {entry.changes && entry.changes.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {entry.changes.map((change, i) => (
                    <p
                      key={i}
                      className="text-xs text-zinc-500 dark:text-zinc-500"
                    >
                      <span className="font-medium">{change.field}:</span>{" "}
                      <span className="line-through decoration-zinc-300 dark:decoration-zinc-700">
                        {String(change.before)}
                      </span>{" "}
                      <span className="text-zinc-400">&rarr;</span>{" "}
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {String(change.after)}
                      </span>
                    </p>
                  ))}
                </div>
              )}
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
                {timeAgo(entry.createdAt)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
