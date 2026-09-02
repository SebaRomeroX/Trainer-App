"use client"

import { useState, useEffect, useCallback } from "react"
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

interface Exercise {
  _id: string
  name: string
  description?: string
  category: string
  muscleGroups: string[]
  equipment: string[]
  difficulty: string
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [difficulty, setDifficulty] = useState("all")

  const [formOpen, setFormOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchExercises = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category !== "all") params.set("category", category)
    if (difficulty !== "all") params.set("difficulty", difficulty)

    try {
      const res = await fetch(`/api/exercises?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setExercises(data.exercises)
      }
    } finally {
      setIsLoading(false)
    }
  }, [search, category, difficulty])

  useEffect(() => {
    const timer = setTimeout(fetchExercises, 300)
    return () => clearTimeout(timer)
  }, [fetchExercises])

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
        fetchExercises()
      }
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
        fetchExercises()
      }
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
        fetchExercises()
      }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
            Exercises
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your exercise library.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
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
