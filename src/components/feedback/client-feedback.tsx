"use client"

import { useState, useEffect } from "react"
import { Star, Pencil, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FeedbackItem {
  _id: string
  difficultyRating: number
  enjoymentRating: number
  message?: string
  routineId?: { _id: string; name: string } | null
  read: boolean
  createdAt: string
}

interface ClientFeedbackProps {
  clientId: string
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

export function ClientFeedback({ clientId }: ClientFeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/clients/${clientId}/feedback`)
        if (res.ok) {
          const data = await res.json()
          setFeedbacks(data.feedbacks)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [clientId])

  if (loading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Loading feedback...
      </p>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No feedback from this client yet.
      </p>
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

          {fb.routineId && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Routine:
              </span>
              <Link
                href={`/dashboard/trainer/routines/${fb.routineId._id}`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {fb.routineId.name}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          {fb.message && (
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
              {fb.message}
            </p>
          )}

          {fb.routineId && (
            <Link href={`/dashboard/trainer/routines/${fb.routineId._id}`}>
              <Button variant="outline" size="sm" className="mt-1">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Modify Routine
              </Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
