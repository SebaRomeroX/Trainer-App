"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Trash2 } from "lucide-react"
import Link from "next/link"

interface ClientUser {
  _id: string
  name: string
  email: string
}

interface ClientRow {
  _id: string
  userId: ClientUser
  fitnessLevel: string
  goals: string[]
  startDate?: string
}

interface ClientTableProps {
  clients: ClientRow[]
  onDelete: (client: ClientRow) => void
}

const fitnessLevelColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function ClientTable({ clients, onDelete }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          No clients yet. Add your first client to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Fitness Level</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client._id}>
              <TableCell className="font-medium">
                {client.userId.name}
              </TableCell>
              <TableCell>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {client.userId.email}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={fitnessLevelColors[client.fitnessLevel]}
                >
                  {client.fitnessLevel}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {client.startDate
                    ? new Date(client.startDate).toLocaleDateString()
                    : "—"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Link
                    href={`/dashboard/trainer/clients/${client._id}`}
                    className="inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] hover:bg-muted hover:text-foreground"
                  >
                    <Eye />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(client)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
