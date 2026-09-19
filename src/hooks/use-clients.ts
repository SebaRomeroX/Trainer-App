import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface ClientUser {
  _id: string
  name: string
  email: string
}

export interface Client {
  _id: string
  userId: ClientUser
  fitnessLevel: string
  goals: string[]
  notes?: string
  startDate?: string
}

export function useClients() {
  const { data, error, isLoading, mutate } = useSWR<{ clients: Client[] }>(
    "/api/clients",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 30000 }
  )
  return { clients: data?.clients ?? [], error, isLoading, mutate }
}
