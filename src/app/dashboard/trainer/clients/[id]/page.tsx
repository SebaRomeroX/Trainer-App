"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, UserPlus, Save, X, Star, Pencil } from "lucide-react"
import Link from "next/link"
import { AssignedRoutinesList } from "@/components/clients/assigned-routines-list"
import { AssignRoutineDialog } from "@/components/routines/assign-routine-dialog"
import { RoutineChangeLog } from "@/components/routines/routine-change-log"
import { ClientFeedback } from "@/components/feedback/client-feedback"

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

interface WorkoutLogEntry {
  _id: string
  routineId: { name: string; difficulty: string } | null
  date: string
  duration: number
  rating?: number
  notes?: string
  exercises: { completed: boolean }[]
}

const fitnessLevelColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function ClientProfilePage() {
  const params = useParams()
  const [client, setClient] = useState<ClientData | null>(null)
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [assignOpen, setAssignOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const [editingGoals, setEditingGoals] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [goalsInput, setGoalsInput] = useState("")
  const [notesInput, setNotesInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [clientRes, logsRes] = await Promise.all([
          fetch(`/api/clients/${params.id}`),
          fetch(`/api/clients/${params.id}/workout-logs`),
        ])

        if (!cancelled && clientRes.ok) {
          const data = await clientRes.json()
          setClient(data.client)
          setGoalsInput(data.client.goals?.join(", ") || "")
          setNotesInput(data.client.notes || "")
        } else if (!cancelled) {
          setError("Client not found.")
        }

        if (!cancelled && logsRes.ok) {
          const logsData = await logsRes.json()
          setWorkoutLogs(logsData.logs || [])
        }
      } catch {
        if (!cancelled) setError("Failed to load client.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id, refreshKey])

  const handleSaveGoals = async () => {
    if (!client) return
    setIsSaving(true)
    try {
      const goals = goalsInput
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
      const res = await fetch(`/api/clients/${client._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals }),
      })
      if (res.ok) {
        const data = await res.json()
        setClient((prev) => (prev ? { ...prev, goals: data.client.goals } : prev))
        setEditingGoals(false)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!client) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/clients/${client._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesInput.trim() || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setClient((prev) => (prev ? { ...prev, notes: data.client.notes } : prev))
        setEditingNotes(false)
      }
    } finally {
      setIsSaving(false)
    }
  }

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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
              Goals
            </h2>
            {!editingGoals && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingGoals(true)}
              >
                <Pencil className="size-4" />
              </Button>
            )}
          </div>
          {editingGoals ? (
            <div className="space-y-2">
              <Input
                value={goalsInput}
                onChange={(e) => setGoalsInput(e.target.value)}
                placeholder="Separate goals with commas"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveGoals} disabled={isSaving}>
                  <Save className="size-4" /> Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingGoals(false)
                    setGoalsInput(client.goals?.join(", ") || "")
                  }}
                >
                  <X className="size-4" /> Cancel
                </Button>
              </div>
            </div>
          ) : client.goals.length > 0 ? (
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

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
            Notes
          </h2>
          {!editingNotes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingNotes(true)}
            >
              <Pencil className="size-4" />
            </Button>
          )}
        </div>
        {editingNotes ? (
          <div className="space-y-2">
            <Textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Add private notes about this client..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveNotes} disabled={isSaving}>
                <Save className="size-4" /> Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingNotes(false)
                  setNotesInput(client.notes || "")
                }}
              >
                <X className="size-4" /> Cancel
              </Button>
            </div>
          </div>
        ) : client.notes ? (
          <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
            {client.notes}
          </p>
        ) : (
          <p className="text-zinc-500">No notes yet.</p>
        )}
      </div>

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

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
          Client Feedback
        </h2>
        <ClientFeedback clientId={params.id as string} />
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
          Routine Change History
        </h2>
        <RoutineChangeLog clientId={params.id as string} showRoutineName />
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
          Workout History
        </h2>
        {workoutLogs.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            No workouts logged yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Routine</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Exercises</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workoutLogs.map((log) => {
                const completed = log.exercises.filter((e) => e.completed).length
                return (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium">
                      {new Date(log.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>
                          {log.routineId?.name ?? "Unknown"}
                        </span>
                        {log.routineId?.difficulty && (
                          <Badge
                            variant="outline"
                            className={difficultyColors[log.routineId.difficulty] ?? ""}
                          >
                            {log.routineId.difficulty}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {log.duration} min
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.rating ? (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < log.rating!
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-zinc-200 dark:text-zinc-700"
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {completed}/{log.exercises.length}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
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
