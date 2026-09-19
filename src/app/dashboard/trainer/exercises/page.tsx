"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExerciseForm } from "@/components/exercises/exercise-form"
import { ExerciseTable } from "@/components/exercises/exercise-table"
import { ExerciseFilters } from "@/components/exercises/exercise-filters"
import { ExerciseDeleteDialog } from "@/components/exercises/exercise-delete-dialog"
import { Plus } from "lucide-react"
import type { CreateExerciseInput } from "@/validators/exercise"
import { useExercises, type Exercise } from "@/hooks/use-exercises"

export default function ExercisesPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [difficulty, setDifficulty] = useState("all")

  const { exercises, isLoading, mutate } = useExercises({ search, category, difficulty })

  const [formOpen, setFormOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreate = async (data: CreateExerciseInput) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setFormOpen(false)
        mutate()
      } else {
        toast.error("Failed to create exercise")
      }
    } catch {
      toast.error("Failed to create exercise")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (data: CreateExerciseInput) => {
    if (!editingExercise) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/exercises/${editingExercise._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setFormOpen(false)
        setEditingExercise(null)
        mutate()
      } else {
        toast.error("Failed to update exercise")
      }
    } catch {
      toast.error("Failed to update exercise")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingExercise) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/exercises/${deletingExercise._id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setDeleteOpen(false)
        setDeletingExercise(null)
        mutate()
      } else {
        toast.error("Failed to delete exercise")
      }
    } catch {
      toast.error("Failed to delete exercise")
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setFormOpen(true)
  }

  const openDeleteDialog = (exercise: Exercise) => {
    setDeletingExercise(exercise)
    setDeleteOpen(true)
  }

  const closeFormDialog = () => {
    setFormOpen(false)
    setEditingExercise(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
            Exercises
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your exercise library.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="self-start">
          <Plus className="size-4" />
          Add Exercise
        </Button>
      </div>

      <ExerciseFilters
        search={search}
        category={category}
        difficulty={difficulty}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onDifficultyChange={setDifficulty}
      />

      {isLoading ? (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      ) : (
        <ExerciseTable
          exercises={exercises}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? "Edit Exercise" : "New Exercise"}
            </DialogTitle>
          </DialogHeader>
          <ExerciseForm
            exercise={editingExercise ?? undefined}
            onSubmit={editingExercise ? handleUpdate : handleCreate}
            onCancel={closeFormDialog}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ExerciseDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        exerciseName={deletingExercise?.name ?? ""}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
