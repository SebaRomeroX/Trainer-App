"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Pause, Trash2 } from "lucide-react"

interface RoutineData {
  _id: string
  name: string
  difficulty: string
  duration: number
}

interface Assignment {
  _id: string
  routine: RoutineData
  assignedDate: string
  startDate: string
  endDate?: string
  status: "active" | "scheduled" | "completed" | "paused"
  progress: number
}

interface AssignedRoutinesListProps {
  clientId: string
  refreshKey?: number
  onRefresh?: () => void
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  scheduled:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed:
    "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
  paused:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
}

export function AssignedRoutinesList({
  clientId,
  refreshKey,
  onRefresh,
}: AssignedRoutinesListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/clients/${clientId}/routines`)
        if (!cancelled && res.ok) {
          const data = await res.json()
          setAssignments(data.routines)
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [clientId, refreshKey])

  async function handleStatusChange(
    assignmentId: string,
    status: "completed" | "paused"
  ) {
    try {
      await fetch(`/api/client-routines/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    } catch (error) {
      console.error("Failed to update status:", error)
    }
    onRefresh?.()
  }

  async function handleRemove(assignmentId: string) {
    try {
      await fetch(`/api/client-routines/${assignmentId}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Failed to remove assignment:", error)
    }
    onRefresh?.()
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading assignments...</p>
  }

  if (assignments.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No routines assigned yet. Assign a routine to get started.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => (
        <div
          key={assignment._id}
          className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-zinc-950 dark:text-zinc-100 truncate">
                {assignment.routine.name}
              </p>
              <Badge
                variant="outline"
                className={statusColors[assignment.status]}
              >
                {assignment.status}
              </Badge>
            </div>
            <p className="text-sm text-zinc-500 mt-0.5">
              {assignment.routine.duration} min
              {assignment.status === "scheduled" && (
                <>
                  {" "}
                  &middot; Starts{" "}
                  {new Date(assignment.startDate).toLocaleDateString()}
                </>
              )}
              {assignment.status === "active" && (
                <>
                  {" "}
                  &middot; Started{" "}
                  {new Date(assignment.startDate).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            {assignment.status === "active" && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Mark as completed"
                  onClick={() =>
                    handleStatusChange(assignment._id, "completed")
                  }
                >
                  <CheckCircle />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Pause"
                  onClick={() => handleStatusChange(assignment._id, "paused")}
                >
                  <Pause />
                </Button>
              </>
            )}
            {(assignment.status === "active" ||
              assignment.status === "scheduled") && (
              <Button
                variant="ghost"
                size="icon-sm"
                title="Remove assignment"
                onClick={() => handleRemove(assignment._id)}
              >
                <Trash2 />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
