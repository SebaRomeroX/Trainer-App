"use client"

import { useState, useEffect } from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"

interface ChartDataPoint {
  date: string
  workoutRating?: number
  difficultyRating?: number
  enjoymentRating?: number
}

const chartConfig = {
  workoutRating: {
    label: "Workout Rating",
    color: "var(--chart-1)",
  },
  difficultyRating: {
    label: "Difficulty",
    color: "var(--chart-2)",
  },
  enjoymentRating: {
    label: "Enjoyment",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

interface RatingsChartProps {
  clientId?: string
  useSelf?: boolean
}

export function RatingsChart({ clientId, useSelf }: RatingsChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  const shouldFetch = useSelf || !!clientId

  useEffect(() => {
    if (!shouldFetch) return

    let cancelled = false
    async function load() {
      try {
        const url = useSelf
          ? "/api/clients/me/ratings"
          : `/api/clients/${clientId}/ratings`
        const res = await fetch(url)
        if (res.ok && !cancelled) {
          const result = await res.json()

          const merged = new Map<string, ChartDataPoint>()

          for (const r of result.ratings) {
            merged.set(r.date, {
              date: r.date,
              workoutRating: r.workoutRating,
            })
          }

          for (const fb of result.feedbackRatings) {
            const existing = merged.get(fb.date) || { date: fb.date }
            merged.set(fb.date, {
              ...existing,
              difficultyRating: fb.difficultyRating,
              enjoymentRating: fb.enjoymentRating,
            })
          }

          const sorted = Array.from(merged.values()).sort((a, b) =>
            a.date.localeCompare(b.date)
          )

          setData(sorted)
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [clientId, useSelf, shouldFetch])

  if (!shouldFetch) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No ratings data yet.
      </p>
    )
  }

  if (loading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Loading ratings chart...
      </p>
    )
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No ratings data yet. Ratings appear after workouts and feedback.
      </p>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => {
            const d = new Date(v)
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }}
          className="text-xs"
        />
        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} className="text-xs" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="workoutRating"
          stroke="var(--color-workoutRating)"
          strokeWidth={2}
          dot={{ r: 4 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="difficultyRating"
          stroke="var(--color-difficultyRating)"
          strokeWidth={2}
          dot={{ r: 4 }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="enjoymentRating"
          stroke="var(--color-enjoymentRating)"
          strokeWidth={2}
          dot={{ r: 4 }}
          connectNulls={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
