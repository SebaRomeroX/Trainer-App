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

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function ClientMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [trainerName, setTrainerName] = useState<string>("Your Trainer")
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [messagesRes, profileRes] = await Promise.all([
          fetch("/api/messages"),
          fetch("/api/clients/me"),
        ])

        if (!cancelled && messagesRes.ok) {
          const data = await messagesRes.json()
          setMessages(data.messages || [])

          if (data.messages?.length > 0) {
            const msg = data.messages[0] as Message
            const other = msg.senderId._id !== msg.receiverId._id ? msg.senderId : msg.receiverId
            setTrainerId(other._id)
            setTrainerName(other.name)
          }
        }

        if (!cancelled && profileRes.ok) {
          const profileData = await profileRes.json()
          if (profileData.client) {
            setMyUserId(profileData.client._id)
          }
          if (profileData.trainer) {
            setTrainerId((prev) => prev ?? profileData.trainer._id)
            setTrainerName((prev) => prev === "Your Trainer" ? profileData.trainer.name : prev)
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    scrollToBottom()
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
        setMessages((prev) => [...prev, data.message])
        setNewMessage("")
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden flex-col">
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
            <p className="text-zinc-500 dark:text-zinc-400">No messages yet. Send a message to your trainer!</p>
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
          <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
