"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  _id: string
  senderId: { _id: string; name: string; avatar?: string }
  receiverId: { _id: string; name: string; avatar?: string }
  content: string
  read: boolean
  createdAt: string
}

interface Conversation {
  userId: string
  user: { name: string; avatar?: string }
  lastMessage: { content: string; createdAt: string; isMine: boolean }
  unreadCount: number
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function TrainerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/messages")
        if (!cancelled && res.ok) {
          const data = await res.json()
          setConversations(data.conversations || [])
        }
      } finally {
        if (!cancelled) setIsLoadingConversations(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selectedUserId) return
    let cancelled = false

    async function loadMessages() {
      setIsLoadingMessages(true)
      try {
        const res = await fetch(`/api/messages?with=${selectedUserId}`)
        if (!cancelled && res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])

          data.messages?.forEach((msg: Message) => {
            if (!msg.read && msg.receiverId._id === selectedUserId) {
              fetch(`/api/messages/${msg._id}/read`, { method: "PUT" })
            }
          })
        }
      } finally {
        if (!cancelled) setIsLoadingMessages(false)
      }
    }
    loadMessages()
    return () => { cancelled = true }
  }, [selectedUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

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
        setMessages((prev) => [...prev, data.message])
        setNewMessage("")

        setConversations((prev) =>
          prev.map((c) =>
            c.userId === selectedUserId
              ? {
                  ...c,
                  lastMessage: {
                    content: newMessage.trim(),
                    createdAt: new Date().toISOString(),
                    isMine: true,
                  },
                }
              : c
          )
        )
      }
    } finally {
      setIsSending(false)
    }
  }

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId)

  return (
    <div className="flex h-[calc(100vh-4rem)] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="w-72 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
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
            <p className="p-4 text-sm text-zinc-500">No conversations yet.</p>
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

      <div className="flex-1 flex flex-col">
        {!selectedUserId ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-500 dark:text-zinc-400">Select a conversation to start messaging.</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
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
                <p className="text-center text-sm text-zinc-500 py-8">No messages yet. Send the first one!</p>
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
                <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
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
