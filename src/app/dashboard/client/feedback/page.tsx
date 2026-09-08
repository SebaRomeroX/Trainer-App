"use client"

import { useState, useEffect } from "react"
import { FeedbackForm } from "@/components/feedback/feedback-form"
import { FeedbackList } from "@/components/feedback/feedback-list"
import { Loader2 } from "lucide-react"

interface FeedbackItem {
  _id: string
  difficultyRating: number
  enjoymentRating: number
  message?: string
  read: boolean
  createdAt: string
}

async function loadFeedbacks(): Promise<FeedbackItem[]> {
  const res = await fetch("/api/feedback?limit=50")
  if (!res.ok) return []
  const data = await res.json()
  return data.feedbacks
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadFeedbacks().then((data) => {
      if (!cancelled) {
        setFeedbacks(data)
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (data: {
    difficultyRating: number
    enjoymentRating: number
    message?: string
    workoutLogId?: string
  }) => {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to submit feedback")
    }

    const updated = await loadFeedbacks()
    setFeedbacks(updated)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
          Feedback
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Share how your workouts are going with your trainer.
        </p>
      </div>

      <FeedbackForm onSubmit={handleSubmit} />

      <div>
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-3">
          Past Feedback
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : (
          <FeedbackList feedbacks={feedbacks} />
        )}
      </div>
    </div>
  )
}
