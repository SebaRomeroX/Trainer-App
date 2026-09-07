"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { AssignedRoutinesList } from "@/components/clients/assigned-routines-list"
import { AssignRoutineDialog } from "@/components/routines/assign-routine-dialog"

interface ClientData {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    avatar?: string
    createdAt: string
  }
  fitnessLevel: string
  goals: string[]
  notes?: string
  startDate?: string
}

const fitnessLevelColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function ClientProfilePage() {
  const params = useParams()
  const [client, setClient] = useState<ClientData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [assignOpen, setAssignOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/clients/${params.id}`)
        if (!cancelled && res.ok) {
          const data = await res.json()
          setClient(data.client)
        } else if (!cancelled) {
          setError("Client not found.")
        }
      } catch {
        if (!cancelled) setError("Failed to load client.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="space-y-6">
        <p className="text-red-500">{error || "Client not found."}</p>
        <Link
          href="/dashboard/trainer/clients"
          className="inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/trainer/clients"
          className="inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
            {client.userId.name}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {client.userId.email}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
            Profile
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-zinc-500">Fitness Level</p>
              <Badge
                variant="outline"
                className={fitnessLevelColors[client.fitnessLevel]}
              >
                {client.fitnessLevel}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Start Date</p>
              <p className="text-zinc-950 dark:text-zinc-100">
                {client.startDate
                  ? new Date(client.startDate).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Member Since</p>
              <p className="text-zinc-950 dark:text-zinc-100">
                {new Date(client.userId.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
            Goals
          </h2>
          {client.goals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {client.goals.map((goal, i) => (
                <Badge key={i} variant="secondary">
                  {goal}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500">No goals set yet.</p>
          )}
        </div>
      </div>

      {client.notes && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
            Notes
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
            {client.notes}
          </p>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
            Assigned Routines
          </h2>
          <Button size="sm" onClick={() => setAssignOpen(true)}>
            <UserPlus className="size-4" />
            Assign Routine
          </Button>
        </div>
        <AssignedRoutinesList
          clientId={client._id}
          refreshKey={refreshKey}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      <AssignRoutineDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        mode="from-client"
        clientId={client._id}
        clientName={client.userId.name}
        onAssigned={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
