"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Client {
  _id: string
  userId: { _id: string; name: string; email: string }
}

interface Routine {
  _id: string
  name: string
  difficulty: string
}

interface AssignRoutineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "from-routine" | "from-client"
  routineId?: string
  routineName?: string
  clientId?: string
  clientName?: string
  onAssigned: () => void
}

export function AssignRoutineDialog({
  open,
  onOpenChange,
  mode,
  routineId,
  routineName,
  clientId,
  clientName,
  onAssigned,
}: AssignRoutineDialogProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [selectedClientId, setSelectedClientId] = useState(clientId || "")
  const [selectedRoutineId, setSelectedRoutineId] = useState(routineId || "")
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const id = requestAnimationFrame(() => {
        setSelectedClientId(clientId || "")
        setSelectedRoutineId(routineId || "")
        setStartDate(new Date().toISOString().split("T")[0])
        setError("")
      })
      prevOpenRef.current = open
      return () => cancelAnimationFrame(id)
    }
    prevOpenRef.current = open
  }, [open, clientId, routineId])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    async function fetchData() {
      setIsFetching(true)
      try {
        if (mode === "from-routine") {
          const res = await fetch("/api/clients")
          if (!cancelled && res.ok) {
            const data = await res.json()
            setClients(data.clients)
          }
        } else {
          const res = await fetch("/api/routines")
          if (!cancelled && res.ok) {
            const data = await res.json()
            setRoutines(data.routines)
          }
        }
      } catch {
        if (!cancelled) setError("Failed to load data.")
      } finally {
        if (!cancelled) setIsFetching(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [open, mode])

  async function handleAssign() {
    const targetClientId = mode === "from-routine" ? selectedClientId : clientId
    const targetRoutineId = mode === "from-client" ? selectedRoutineId : routineId

    if (!targetClientId) {
      setError("Please select a client.")
      return
    }
    if (!targetRoutineId) {
      setError("Please select a routine.")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const res = await fetch(`/api/routines/${targetRoutineId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: targetClientId,
          startDate: startDate || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to assign routine.")
        return
      }

      onAssigned()
      onOpenChange(false)
    } catch {
      setError("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  const displayLabel =
    mode === "from-routine"
      ? routineName || "selected routine"
      : clientName || "selected client"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Routine</DialogTitle>
          <DialogDescription>
            Assign {displayLabel}{" "}
            {mode === "from-routine"
              ? "to one of your clients."
              : "to one of your routines."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "from-routine" && (
            <div className="space-y-2">
              <Label>Client</Label>
              {isFetching ? (
                <p className="text-sm text-zinc-500">Loading clients...</p>
              ) : (
                <Select
                  value={selectedClientId}
                  onValueChange={(v) => setSelectedClientId(v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.userId.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {mode === "from-client" && (
            <div className="space-y-2">
              <Label>Routine</Label>
              {isFetching ? (
                <p className="text-sm text-zinc-500">Loading routines...</p>
              ) : (
                <Select
                  value={selectedRoutineId}
                  onValueChange={(v) => setSelectedRoutineId(v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a routine" />
                  </SelectTrigger>
                  <SelectContent>
                    {routines.map((routine) => (
                      <SelectItem key={routine._id} value={routine._id}>
                        {routine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <p className="text-xs text-zinc-500">
              Leave as today to assign immediately. Pick a future date to
              schedule this routine as the next one.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading || isFetching}>
            {isLoading ? "Assigning..." : "Assign Routine"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
