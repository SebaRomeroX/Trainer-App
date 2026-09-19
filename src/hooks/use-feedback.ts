import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface FeedbackItem {
  _id: string
  difficultyRating: number
  enjoymentRating: number
  message?: string
  read: boolean
  createdAt: string
}

export function useFeedback() {
  const { data, error, isLoading, mutate } = useSWR<{ feedbacks: FeedbackItem[] }>(
    "/api/feedback?limit=50",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 30000 }
  )
  return { feedbacks: data?.feedbacks ?? [], error, isLoading, mutate }
}
