"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RoutineTable } from "@/components/routines/routine-table"
import { RoutineDeleteDialog } from "@/components/routines/routine-delete-dialog"
import { AssignRoutineDialog } from "@/components/routines/assign-routine-dialog"
import { Plus } from "lucide-react"

interface RoutineRow {
  _id: string
  name: string
  difficulty: string
  duration: number
  exercises: { exerciseId: string }[]
  isTemplate: boolean
}

export default function RoutinesPage() {
  const router = useRouter()
  const [routines, setRoutines] = useState<RoutineRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingRoutine, setDeletingRoutine] = useState<RoutineRow | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const [assignOpen, setAssignOpen] = useState(false)
  const [assigningRoutine, setAssigningRoutine] = useState<RoutineRow | null>(
    null
  )

  const fetchRoutines = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/routines")
      if (res.ok) {
        const data = await res.json()
        setRoutines(data.routines)
      } else {
        toast.error("Failed to load routines")
      }
    } catch {
      toast.error("Failed to load routines")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const [loaded, setLoaded] = useState(false)
  if (!loaded) {
    setLoaded(true)
    fetchRoutines()
  }

  const handleDelete = async () => {
    if (!deletingRoutine) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/routines/${deletingRoutine._id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setDeleteOpen(false)
        setDeletingRoutine(null)
        fetchRoutines()
      } else {
        toast.error("Failed to delete routine")
      }
    } catch {
      toast.error("Failed to delete routine")
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (routine: RoutineRow) => {
    router.push(`/dashboard/trainer/routines/${routine._id}`)
  }

  const openDeleteDialog = (routine: RoutineRow) => {
    setDeletingRoutine(routine)
    setDeleteOpen(true)
  }

  const openAssignDialog = (routine: RoutineRow) => {
    setAssigningRoutine(routine)
    setAssignOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
            Routines
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create and manage workout routines.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/trainer/routines/new")} className="self-start">
          <Plus className="size-4" />
          New Routine
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      ) : (
        <RoutineTable
          routines={routines}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onAssign={openAssignDialog}
        />
      )}

      <RoutineDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        routineName={deletingRoutine?.name ?? ""}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      <AssignRoutineDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        mode="from-routine"
        routineId={assigningRoutine?._id}
        routineName={assigningRoutine?.name}
        onAssigned={fetchRoutines}
      />
    </div>
  )
}
