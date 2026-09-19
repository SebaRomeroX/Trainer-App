"use client"

import { FeedbackForm } from "@/components/feedback/feedback-form"
import { FeedbackList } from "@/components/feedback/feedback-list"
import { Loader2 } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"

export default function FeedbackPage() {
  const { feedbacks, isLoading, error, mutate } = useFeedback()

  const handleSubmit = async (data: {
    difficultyRating: number
    enjoymentRating: number
    message?: string
    workoutLogId?: string
    routineId?: string
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

    mutate()
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
        ) : error ? (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">Failed to load feedback</p>
          </div>
        ) : (
          <FeedbackList feedbacks={feedbacks} />
        )}
      </div>
    </div>
  )
}
