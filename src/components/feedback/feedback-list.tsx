"use client"

import { Star } from "lucide-react"

interface FeedbackItem {
  _id: string
  difficultyRating: number
  enjoymentRating: number
  message?: string
  read: boolean
  createdAt: string
}

interface FeedbackListProps {
  feedbacks: FeedbackItem[]
}

function RatingDisplay({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-zinc-500">{label}:</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < value
                ? "fill-yellow-400 text-yellow-400"
                : "text-zinc-200 dark:text-zinc-700"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function FeedbackList({ feedbacks }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          No feedback yet. Share how your workouts are going.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {feedbacks.map((fb) => (
        <div
          key={fb._id}
          className={`rounded-lg border p-4 ${
            !fb.read
              ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <RatingDisplay label="Difficulty" value={fb.difficultyRating} />
              <RatingDisplay label="Enjoyment" value={fb.enjoymentRating} />
            </div>
            <span className="text-xs text-zinc-500">
              {new Date(fb.createdAt).toLocaleDateString()}
            </span>
          </div>
          {fb.message && (
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {fb.message}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
