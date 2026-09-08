"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, Loader2, CheckCircle2 } from "lucide-react"

interface FeedbackFormProps {
  onSubmit: (data: {
    difficultyRating: number
    enjoymentRating: number
    message?: string
    workoutLogId?: string
  }) => Promise<void>
}

function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`h-9 w-9 rounded-md text-sm font-medium transition-colors ${
              value === v
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [difficulty, setDifficulty] = useState<number | null>(null)
  const [enjoyment, setEnjoyment] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!difficulty || !enjoyment) {
      setError("Please rate both difficulty and enjoyment.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        difficultyRating: difficulty,
        enjoymentRating: enjoyment,
        message: message.trim() || undefined,
      })
      setSubmitted(true)
      setDifficulty(null)
      setEnjoyment(null)
      setMessage("")
    } catch {
      setError("Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
        <p className="text-green-700 dark:text-green-300 font-medium">
          Feedback submitted!
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-sm text-green-600 dark:text-green-400 underline"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
      <h3 className="font-medium text-zinc-950 dark:text-zinc-100">
        Send Feedback to Trainer
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <RatingInput
          label="How difficult was it?"
          value={difficulty}
          onChange={setDifficulty}
        />
        <RatingInput
          label="How much did you enjoy it?"
          value={enjoyment}
          onChange={setEnjoyment}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium">Message (optional)</Label>
        <Textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any additional thoughts..."
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Send Feedback
      </Button>
    </div>
  )
}
