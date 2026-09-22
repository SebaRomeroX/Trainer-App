"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Shield, Trash2 } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export interface Trainer {
  _id: string
  name: string
  email: string
  isAdmin: boolean
  bio?: string
  specialties: string[]
  createdAt: string
}

export function TrainerTable({ onCreateClick }: { onCreateClick: () => void }) {
  const { data, isLoading, error, mutate } = useSWR<{ trainers: Trainer[] }>(
    "/api/trainers",
    fetcher,
    { dedupingInterval: 30000 }
  )
  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/trainers/${deleteTarget._id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        mutate()
        setDeleteTarget(null)
      }
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
        <p className="text-red-600 dark:text-red-400">
          Failed to load trainers. Please try again later.
        </p>
      </div>
    )
  }

  const trainers = data?.trainers ?? []

  if (trainers.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
        <p className="text-zinc-500 mb-4">No trainers yet.</p>
        <Button onClick={onCreateClick}>Add First Trainer</Button>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers.map((trainer) => (
              <TableRow key={trainer._id}>
                <TableCell className="font-medium">{trainer.name}</TableCell>
                <TableCell className="text-zinc-500">{trainer.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {trainer.specialties.length > 0 ? (
                      trainer.specialties.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-zinc-400 text-sm">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {trainer.isAdmin ? (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                      <Shield className="mr-1 h-3 w-3" />
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Trainer</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {!trainer.isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(trainer)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {trainers.map((trainer) => (
          <div
            key={trainer._id}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-zinc-950 dark:text-zinc-100">
                {trainer.name}
              </p>
              <div className="flex items-center gap-2">
                {trainer.isAdmin && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                )}
                {!trainer.isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(trainer)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-zinc-500">{trainer.email}</p>
            {trainer.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {trainer.specialties.slice(0, 3).map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Trainer</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
