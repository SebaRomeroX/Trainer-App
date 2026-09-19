import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface Message {
  _id: string
  senderId: { _id: string; name: string; avatar?: string }
  receiverId: { _id: string; name: string; avatar?: string }
  content: string
  read: boolean
  createdAt: string
}

export interface Conversation {
  userId: string
  user: { name: string; avatar?: string }
  lastMessage: { content: string; createdAt: string; isMine: boolean }
  unreadCount: number
}

export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR<{ conversations: Conversation[] }>(
    "/api/messages",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 10000 }
  )
  return { conversations: data?.conversations ?? [], error, isLoading, mutate }
}

export function useMessages(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ messages: Message[] }>(
    userId ? `/api/messages?with=${userId}` : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 5000 }
  )
  return { messages: data?.messages ?? [], error, isLoading, mutate }
}
