import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface RoutineInfo {
  _id: string
  name: string
  difficulty: string
}

export interface WorkoutLog {
  _id: string
  routineId: RoutineInfo
  date: string
  duration: number
  rating?: number
  notes?: string
  exercises: {
    completed: boolean
  }[]
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export function useWorkoutLogs(page: number = 1, limit: number = 15) {
  const { data, error, isLoading } = useSWR<{ logs: WorkoutLog[]; pagination: Pagination }>(
    `/api/workout-logs?page=${page}&limit=${limit}`,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 30000 }
  )
  return {
    logs: data?.logs ?? [],
    pagination: data?.pagination ?? null,
    error,
    isLoading,
  }
}
