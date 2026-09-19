import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface WorkoutStats {
  totalWorkouts: number
  workoutsThisWeek: number
  averageRating: number
  currentStreak: number
}

export function useWorkoutStats() {
  const { data, error, isLoading } = useSWR<WorkoutStats>(
    "/api/workout-logs/stats",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 30000 }
  )
  return { stats: data ?? null, error, isLoading }
}
