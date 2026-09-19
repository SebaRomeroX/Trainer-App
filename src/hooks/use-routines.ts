import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface RoutineRow {
  _id: string
  name: string
  difficulty: string
  duration: number
  exercises: { exerciseId: string }[]
  isTemplate: boolean
}

export function useRoutines() {
  const { data, error, isLoading, mutate } = useSWR<{ routines: RoutineRow[] }>(
    "/api/routines",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 30000 }
  )
  return { routines: data?.routines ?? [], error, isLoading, mutate }
}

export function useRoutine(id: string | null) {
  const { data, error, isLoading } = useSWR<{ routine: RoutineRow }>(
    id ? `/api/routines/${id}` : null,
    fetcher
  )
  return { routine: data?.routine ?? null, error, isLoading }
}
