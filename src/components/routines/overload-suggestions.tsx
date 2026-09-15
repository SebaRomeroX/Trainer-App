"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Check, X, Pencil, RefreshCw, TrendingUp } from "lucide-react"

interface ExerciseInfo {
  _id: string
  name: string
  category: string
}

interface Suggestion {
  _id: string
  exerciseId: ExerciseInfo
  currentWeight?: number
  currentReps?: number
  currentSets?: number
  suggestedWeight?: number
  suggestedReps?: number
  suggestedSets?: number
  status: "pending" | "approved" | "denied" | "applied"
  createdAt: string
}

interface OverloadSuggestionsProps {
  planId: string
  onRefresh?: () => void
}

export function OverloadSuggestions({
  planId,
  onRefresh,
}: OverloadSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"pending" | "approved" | "denied">(
    "pending"
  )
  const [resolving, setResolving] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    weight?: number
    reps?: number
    sets?: number
  }>({})
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchSuggestions() {
      setIsLoading(true)
      try {
        const res = await fetch(
          `/api/progressive-overload/${planId}/suggestions?status=${filter}`,
          { signal: controller.signal }
        )
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.suggestions)
        }
      } catch {
        toast.error("Failed to load suggestions")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()

    return () => controller.abort()
  }, [planId, filter])

  async function loadSuggestions() {
    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/progressive-overload/${planId}/suggestions?status=${filter}`
      )
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions)
      }
    } catch {
      toast.error("Failed to load suggestions")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResolve(
    suggestionId: string,
    action: "approved" | "denied"
  ) {
    setResolving(suggestionId)
    try {
      const body: Record<string, unknown> = { action }
      if (action === "approved" && editingId === suggestionId) {
        if (editValues.weight !== undefined) body.customWeight = editValues.weight
        if (editValues.reps !== undefined) body.customReps = editValues.reps
        if (editValues.sets !== undefined) body.customSets = editValues.sets
      }

      const res = await fetch(
        `/api/progressive-overload/suggestions/${suggestionId}/resolve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )

      if (res.ok) {
        setEditingId(null)
        setEditValues({})
        loadSuggestions()
        onRefresh?.()
      } else {
        toast.error("Failed to resolve suggestion")
      }
    } catch {
      toast.error("Failed to resolve suggestion")
    } finally {
      setResolving(null)
    }
  }

  async function handleCheckNow() {
    setIsChecking(true)
    try {
      const res = await fetch(
        `/api/progressive-overload/${planId}/suggestions`,
        { method: "POST" }
      )
      if (res.ok) {
        loadSuggestions()
        onRefresh?.()
      } else {
        toast.error("Failed to check suggestions")
      }
    } catch {
      toast.error("Failed to check suggestions")
    } finally {
      setIsChecking(false)
    }
  }

  function startEditing(suggestion: Suggestion) {
    setEditingId(suggestion._id)
    setEditValues({
      weight: suggestion.suggestedWeight,
      reps: suggestion.suggestedReps,
      sets: suggestion.suggestedSets,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(["pending", "approved", "denied"] as const).map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        {filter === "pending" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckNow}
            disabled={isChecking}
          >
            <RefreshCw
              className={`size-3.5 ${isChecking ? "animate-spin" : ""}`}
            />
            Check Now
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading suggestions...</p>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {filter === "pending"
            ? "No pending suggestions. Suggestions are generated weekly or after client feedback."
            : `No ${filter} suggestions.`}
        </p>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div
              key={s._id}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-zinc-950 dark:text-zinc-100">
                  {s.exerciseId?.name || "Unknown Exercise"}
                </p>
                <Badge
                  variant="outline"
                  className={
                    s.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      : s.status === "approved" || s.status === "applied"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }
                >
                  {s.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-zinc-500">Current</p>
                  <div className="flex gap-2 flex-wrap">
                    {s.currentWeight !== undefined && (
                      <span className="text-zinc-950 dark:text-zinc-100">
                        {s.currentWeight}kg
                      </span>
                    )}
                    {s.currentReps !== undefined && (
                      <span className="text-zinc-950 dark:text-zinc-100">
                        {s.currentReps} reps
                      </span>
                    )}
                    {s.currentSets !== undefined && (
                      <span className="text-zinc-950 dark:text-zinc-100">
                        {s.currentSets} sets
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 flex items-center gap-1">
                    <TrendingUp className="size-3" /> Suggested
                  </p>
                  {editingId === s._id ? (
                    <div className="flex gap-1.5">
                      {s.suggestedWeight !== undefined && (
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          className="h-7 text-xs w-16"
                          value={editValues.weight ?? ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              weight: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            }))
                          }
                        />
                      )}
                      {s.suggestedReps !== undefined && (
                        <Input
                          type="number"
                          min="1"
                          className="h-7 text-xs w-14"
                          value={editValues.reps ?? ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              reps: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            }))
                          }
                        />
                      )}
                      {s.suggestedSets !== undefined && (
                        <Input
                          type="number"
                          min="1"
                          className="h-7 text-xs w-14"
                          value={editValues.sets ?? ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              sets: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            }))
                          }
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {s.suggestedWeight !== undefined && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {s.suggestedWeight}kg
                        </span>
                      )}
                      {s.suggestedReps !== undefined && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {s.suggestedReps} reps
                        </span>
                      )}
                      {s.suggestedSets !== undefined && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {s.suggestedSets} sets
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {s.status === "pending" && (
                <div className="flex gap-2">
                  {editingId === s._id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleResolve(s._id, "approved")}
                        disabled={resolving === s._id}
                      >
                        <Check className="size-3.5" /> Apply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(null)
                          setEditValues({})
                        }}
                      >
                        Cancel Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleResolve(s._id, "approved")}
                        disabled={resolving === s._id}
                      >
                        <Check className="size-3.5" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(s)}
                      >
                        <Pencil className="size-3.5" /> Edit & Apply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolve(s._id, "denied")}
                        disabled={resolving === s._id}
                      >
                        <X className="size-3.5" /> Deny
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
