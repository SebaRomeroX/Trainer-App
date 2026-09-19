"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClientOnboardingWizard } from "@/components/clients/client-onboarding-wizard"
import { ClientTable } from "@/components/clients/client-table"
import { ClientDeleteDialog } from "@/components/clients/client-delete-dialog"
import { Plus, Search } from "lucide-react"
import { useClients, type Client } from "@/hooks/use-clients"

export default function ClientsPage() {
  const { clients, isLoading, mutate } = useClients()
  const [search, setSearch] = useState("")

  const [wizardOpen, setWizardOpen] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredClients = clients.filter((client) => {
    if (!search) return true
    const query = search.toLowerCase()
    return (
      client.userId.name.toLowerCase().includes(query) ||
      client.userId.email.toLowerCase().includes(query)
    )
  })

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
        mutate()
      } else {
        toast.error("Failed to delete client")
      }
    } catch {
      toast.error("Failed to delete client")
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
            Clients
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your assigned clients.
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)} className="self-start">
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

      <ClientOnboardingWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onComplete={() => mutate()}
      />

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
