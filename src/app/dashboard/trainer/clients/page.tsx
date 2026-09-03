"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ClientForm } from "@/components/clients/client-form"
import { ClientTable } from "@/components/clients/client-table"
import { ClientDeleteDialog } from "@/components/clients/client-delete-dialog"
import { Plus, Search } from "lucide-react"
import type { CreateClientInput } from "@/validators/client"

interface ClientUser {
  _id: string
  name: string
  email: string
}

interface Client {
  _id: string
  userId: ClientUser
  fitnessLevel: string
  goals: string[]
  notes?: string
  startDate?: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/clients")
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchClients, 0)
    return () => clearTimeout(timer)
  }, [fetchClients])

  const filteredClients = clients.filter((client) => {
    if (!search) return true
    const query = search.toLowerCase()
    return (
      client.userId.name.toLowerCase().includes(query) ||
      client.userId.email.toLowerCase().includes(query)
    )
  })

  const handleCreate = async (data: CreateClientInput) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setFormOpen(false)
        fetchClients()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingClient) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/clients/${deletingClient._id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setDeleteOpen(false)
        setDeletingClient(null)
        fetchClients()
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteDialog = (client: Client) => {
    setDeletingClient(client)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
            Clients
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your assigned clients.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Add Client
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      ) : (
        <ClientTable
          clients={filteredClients}
          onDelete={openDeleteDialog}
        />
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSubmit={handleCreate}
            onCancel={() => setFormOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ClientDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        clientName={deletingClient?.userId.name ?? ""}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
