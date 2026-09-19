import useSWR from "swr"
import { useMemo } from "react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface Exercise {
  _id: string
  name: string
  description?: string
  category: string
  muscleGroups: string[]
  equipment: string[]
  difficulty: string
}

interface ExerciseFilters {
  search?: string
  category?: string
  difficulty?: string
}

export function useExercises(filters: ExerciseFilters = {}) {
  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (filters.search) p.set("search", filters.search)
    if (filters.category && filters.category !== "all") p.set("category", filters.category)
    if (filters.difficulty && filters.difficulty !== "all") p.set("difficulty", filters.difficulty)
    return p.toString()
  }, [filters.search, filters.category, filters.difficulty])

  const url = `/api/exercises${params ? `?${params}` : ""}`

  const { data, error, isLoading, mutate } = useSWR<{ exercises: Exercise[] }>(
    url,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 30000 }
  )

  return { exercises: data?.exercises ?? [], error, isLoading, mutate }
}
