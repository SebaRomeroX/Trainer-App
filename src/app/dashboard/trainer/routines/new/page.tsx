"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RoutineForm } from "@/components/routines/routine-form"
import type { CreateRoutineInput } from "@/validators/routine"

export default function NewRoutinePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CreateRoutineInput) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push("/dashboard/trainer/routines")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
          New Routine
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Create a new workout routine.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <RoutineForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/trainer/routines")}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  )
}
