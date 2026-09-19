import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface ClientData {
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

export interface WorkoutLogEntry {
  _id: string
  routineId: { name: string; difficulty: string } | null
  date: string
  duration: number
  rating?: number
  notes?: string
  exercises: { completed: boolean }[]
}

export interface AssignmentEntry {
  _id: string
  routine: { _id: string; name: string; exercises?: { exerciseId: string }[] } | null
  status: "active" | "scheduled" | "completed" | "paused"
}

export function useClientDetail(id: string | null) {
  const shouldFetch = Boolean(id)

  const client = useSWR<{ client: ClientData }>(
    shouldFetch ? `/api/clients/${id}` : null,
    fetcher
  )

  const logs = useSWR<{ logs: WorkoutLogEntry[] }>(
    shouldFetch ? `/api/clients/${id}/workout-logs` : null,
    fetcher
  )

  const routines = useSWR<{ routines: AssignmentEntry[] }>(
    shouldFetch ? `/api/clients/${id}/routines` : null,
    fetcher
  )

  return {
    client: client.data?.client ?? null,
    workoutLogs: logs.data?.logs ?? [],
    assignments: routines.data?.routines ?? [],
    isLoading: client.isLoading || logs.isLoading || routines.isLoading,
    error: client.error || logs.error || routines.error,
    mutate: () => {
      client.mutate()
      logs.mutate()
      routines.mutate()
    },
  }
}
