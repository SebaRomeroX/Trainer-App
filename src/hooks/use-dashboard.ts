import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface DashboardData {
  stats: {
    totalClients: number
    activeRoutines: number
    workoutsThisWeek: number
    avgRating: number
  }
  clients: Array<{
    clientId: string
    name: string
    avatar?: string
    fitnessLevel: string
    workoutsThisWeek: number
    totalWorkouts: number
    streak: number
    activeRoutineName: string | null
    completionRate: number
    lastWorkoutDate: string | null
  }>
  recentActivity: Array<{
    workoutLogId: string
    clientName: string
    routineName: string
    date: string
    duration: number
    rating?: number
    exercisesCompleted: number
    totalExercises: number
  }>
}

export function useDashboard() {
  const { data, error, isLoading } = useSWR<DashboardData>(
    "/api/trainer/dashboard",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 30000 }
  )
  return { data, error, isLoading }
}
