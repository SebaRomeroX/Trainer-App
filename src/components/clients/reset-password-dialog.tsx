"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Copy, RefreshCw } from "lucide-react"
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

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
}: ResetPasswordDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null
  )

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setTemporaryPassword(null)
      setIsPending(false)
    }
    onOpenChange(nextOpen)
  }

  async function handleReset() {
    setIsPending(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/reset-password`, {
        method: "POST",
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to reset password.")
        setIsPending(false)
        return
      }

      setTemporaryPassword(data.temporaryPassword)
      toast.success("Password reset.")
    } catch {
      toast.error("Failed to reset password.")
      setIsPending(false)
    }
  }

  async function handleCopy() {
    if (!temporaryPassword) return
    try {
      await navigator.clipboard.writeText(temporaryPassword)
      toast.success("Copied to clipboard.")
    } catch {
      toast.error("Failed to copy.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {temporaryPassword ? "New password" : "Reset password"}
          </DialogTitle>
          <DialogDescription>
            {temporaryPassword ? (
              "Share this password with your client. It will not be shown again."
            ) : (
              <>
                This will replace the current password for{" "}
                <strong>{clientName}</strong>. They will need to use the new
                password the next time they sign in.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {temporaryPassword && (
          <div className="space-y-2">
            <Input
              readOnly
              value={temporaryPassword}
              onFocus={(e) => e.currentTarget.select()}
              className="font-mono"
              aria-label="Temporary password"
            />
            <p className="text-xs text-zinc-500">
              Copy it now — closing this dialog will hide it permanently.
            </p>
          </div>
        )}

        <DialogFooter>
          {temporaryPassword ? (
            <>
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="size-4" />
                Copy
              </Button>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={isPending}
              >
                <RefreshCw className="size-4" />
                {isPending ? "Resetting..." : "Reset password"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
