"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"
import { Send, MessageSquare, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/shared/empty-state"
import { useConversations, useMessages, type Message } from "@/hooks/use-messages"
import { useErrorToast } from "@/hooks/use-error-toast"

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function TrainerMessagesPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<string | null>(null)
  const markedReadRef = useRef<Set<string>>(new Set())

  const {
    conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
    mutate: mutateConversations,
  } = useConversations()

  const {
    messages,
    isLoading: isLoadingMessages,
    error: messagesError,
    mutate: mutateMessages,
  } = useMessages(selectedUserId)

  useErrorToast(conversationsError, "Failed to load conversations")
  useErrorToast(messagesError, "Failed to load messages")

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Reset per-conversation bookkeeping when the thread changes.
  useEffect(() => {
    lastMessageIdRef.current = null
    markedReadRef.current = new Set()
  }, [selectedUserId])

  // Only scroll when a new message actually arrives — polls that return
  // unchanged data must not yank the view while the trainer is reading.
  useEffect(() => {
    const lastId = messages[messages.length - 1]?._id ?? null
    if (lastId && lastId !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastId
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  // Mark incoming messages as read at most once each, even across polls.
  useEffect(() => {
    if (!selectedUserId) return

    const toMark = messages.filter(
      (msg) =>
        !msg.read &&
        msg.receiverId._id !== selectedUserId &&
        !markedReadRef.current.has(msg._id)
    )
    if (toMark.length === 0) return

    toMark.forEach((msg) => markedReadRef.current.add(msg._id))
    Promise.all(
      toMark.map((msg) =>
        fetch(`/api/messages/${msg._id}/read`, { method: "PUT" })
          .then((res) => {
            if (!res.ok) markedReadRef.current.delete(msg._id)
            return res.ok
          })
          .catch(() => {
            markedReadRef.current.delete(msg._id)
            return false
          })
      )
    ).then((results) => {
      if (results.some(Boolean)) mutateConversations()
    })
  }, [messages, selectedUserId, mutateConversations])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId || isSending) return

    setIsSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedUserId, content: newMessage.trim() }),
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
        mutateConversations()
      } else {
        toast.error("Failed to send message")
      }
    } catch {
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId)

  return (
    <div className="flex h-[calc(100vh-8rem)] sm:h-[calc(100vh-4rem)] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Conversation list — hidden on mobile when chat is open */}
      <div className={`${selectedUserId ? "hidden" : "flex"} md:flex w-full md:w-72 border-r border-zinc-200 dark:border-zinc-800 flex-col`}>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              className="py-8"
            />
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => setSelectedUserId(conv.userId)}
                className={`w-full text-left px-4 py-3 border-b border-zinc-100 dark:border-zinc-900 transition-colors ${
                  selectedUserId === conv.userId
                    ? "bg-zinc-100 dark:bg-zinc-900"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-950 dark:text-zinc-100 truncate">
                    {conv.user.name}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {conv.lastMessage.isMine ? "You: " : ""}
                  {conv.lastMessage.content}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat view — full width on mobile, flex-1 on desktop */}
      <div className={`${selectedUserId ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0`}>
        {!selectedUserId ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the sidebar to start messaging."
            />
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                onClick={() => setSelectedUserId(null)}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-100">
                {selectedConversation?.user.name}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingMessages ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-10 rounded-lg w-1/3 animate-pulse bg-zinc-100 dark:bg-zinc-900 ${i % 2 === 0 ? "ml-auto" : ""}`} />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No messages yet"
                  description="Send the first one!"
                  className="py-8"
                />
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId._id !== selectedUserId
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
          </>
        )}
      </div>
    </div>
  )
}
