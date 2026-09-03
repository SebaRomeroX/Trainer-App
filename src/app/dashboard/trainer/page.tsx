"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Dumbbell, ListOrdered } from "lucide-react"

export default function TrainerDashboardPage() {
  const [counts, setCounts] = useState({ clients: 0, exercises: 0, routines: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [clientsRes, exercisesRes, routinesRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/exercises"),
          fetch("/api/routines"),
        ])

        const clientsData = clientsRes.ok ? await clientsRes.json() : { clients: [] }
        const exercisesData = exercisesRes.ok ? await exercisesRes.json() : { exercises: [] }
        const routinesData = routinesRes.ok ? await routinesRes.json() : { routines: [] }

        setCounts({
          clients: clientsData.clients?.length ?? 0,
          exercises: exercisesData.exercises?.length ?? 0,
          routines: routinesData.routines?.length ?? 0,
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCounts()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
        Trainer Dashboard
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Welcome back. Manage your clients and routines from here.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/trainer/clients"
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="size-5 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-500">Clients</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-100">
            {isLoading ? "—" : counts.clients}
          </p>
        </Link>

        <Link
          href="/dashboard/trainer/routines"
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ListOrdered className="size-5 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-500">Routines</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-100">
            {isLoading ? "—" : counts.routines}
          </p>
        </Link>

        <Link
          href="/dashboard/trainer/exercises"
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Dumbbell className="size-5 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-500">Exercises</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-100">
            {isLoading ? "—" : counts.exercises}
          </p>
        </Link>
      </div>
    </div>
  )
}
