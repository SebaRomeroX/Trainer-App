"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"
import { Send, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/shared/empty-state"
import { useMessages, type Message } from "@/hooks/use-messages"
import { useErrorToast } from "@/hooks/use-error-toast"

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function ClientMessagesPage() {
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [trainerName, setTrainerName] = useState<string>("Your Trainer")
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<string | null>(null)

  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    mutate: mutateMessages,
  } = useMessages(trainerId)

  useErrorToast(messagesError, "Failed to load messages")

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/clients/me")
        if (!cancelled) {
          if (res.ok) {
            const profileData = await res.json()
            if (profileData.client?._id) {
              setMyUserId(profileData.client._id)
            }
            if (profileData.trainer) {
              setTrainerId(profileData.trainer._id)
              setTrainerName(profileData.trainer.name)
            }
          } else {
            toast.error("Failed to load conversation")
          }
        }
      } catch {
        if (!cancelled) toast.error("Failed to load conversation")
      } finally {
        if (!cancelled) setIsLoadingProfile(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Reset scroll bookkeeping when the thread changes.
  useEffect(() => {
    lastMessageIdRef.current = null
  }, [trainerId])

  // Only scroll when a new message actually arrives — polls that return
  // unchanged data must not yank the view while the client is reading.
  useEffect(() => {
    const lastId = messages[messages.length - 1]?._id ?? null
    if (lastId && lastId !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastId
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    if (!newMessage.trim() || !trainerId || isSending) return

    setIsSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: trainerId, content: newMessage.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        setNewMessage("")
        await mutateMessages(
          (current) => ({
            messages: [...(current?.messages ?? []), data.message as Message],
          }),
          { revalidate: true }
        )
      } else {
        toast.error("Failed to send message")
      }
    } catch {
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const isLoading = isLoadingProfile || isLoadingMessages

  return (
    <div className="flex h-[calc(100vh-8rem)] sm:h-[calc(100vh-4rem)] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden flex-col">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
          Messages with {trainerName}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`h-10 rounded-lg w-1/3 animate-pulse bg-zinc-100 dark:bg-zinc-900 ${i % 2 === 0 ? "ml-auto" : ""}`} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Send a message to your trainer!"
            />
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = myUserId
              ? msg.senderId._id === myUserId
              : msg.senderId._id !== trainerId
            return (
              <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                    isMine
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-zinc-500"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending} aria-label="Send message">
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
