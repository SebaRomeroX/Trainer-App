"use client"

interface WeekDay {
  label: string
  count: number
}

interface WeeklyChartProps {
  data: WeekDay[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const hasData = data.some((d) => d.count > 0)

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
      <h3 className="text-sm font-medium text-zinc-500 mb-4">
        Workouts This Week
      </h3>
      {hasData ? (
        <div className="flex items-end gap-2 h-32">
          {data.map((day) => (
            <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-zinc-500">{day.count}</span>
              <div className="w-full flex justify-center">
                <div
                  className="w-full max-w-[2rem] rounded-t-md bg-zinc-900 dark:bg-zinc-100 transition-all"
                  style={{
                    height: `${day.count > 0 ? Math.max((day.count / maxCount) * 100, 8) : 4}px`,
                    opacity: day.count > 0 ? 1 : 0.2,
                  }}
                />
              </div>
              <span className="text-xs text-zinc-500">{day.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-400 text-center py-8">
          No workouts this week yet.
        </p>
      )}
    </div>
  )
}
