"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy, Check } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface CreateTrainerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTrainerDialog({ open, onOpenChange }: CreateTrainerDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [specialties, setSpecialties] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ trainer: { name: string }; tempPassword: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const { mutate } = useSWR<{ trainers: unknown[] }>("/api/trainers", fetcher)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError(null)

    try {
      const res = await fetch("/api/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          bio: bio || undefined,
          specialties: specialties
            ? specialties.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.errors?.email?.[0] || data.error || "Failed to create trainer.")
        return
      }

      setResult(data)
      mutate()
      setName("")
      setEmail("")
      setBio("")
      setSpecialties("")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  const handleCopy = () => {
    if (result?.tempPassword) {
      navigator.clipboard.writeText(result.tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setResult(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {result ? (
          <>
            <DialogHeader>
              <DialogTitle>Trainer Created</DialogTitle>
              <DialogDescription>
                Share the temporary password with <strong>{result.trainer.name}</strong>.
                They should change it after first login.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm font-mono break-all">
                  {result.tempPassword}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                This password will not be shown again.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Trainer</DialogTitle>
              <DialogDescription>
                Create a new trainer account. They will receive a temporary password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="trainer-name">Name</Label>
                <Input
                  id="trainer-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainer-email">Email</Label>
                <Input
                  id="trainer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainer-bio">Bio (optional)</Label>
                <Input
                  id="trainer-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Certified strength coach..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainer-specialties">Specialties (optional)</Label>
                <Input
                  id="trainer-specialties"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="Strength, HIIT, Mobility (comma-separated)"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating..." : "Create Trainer"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
