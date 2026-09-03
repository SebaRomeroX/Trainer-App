"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ClientDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientName: string
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export function ClientDeleteDialog({
  open,
  onOpenChange,
  clientName,
  onConfirm,
  isLoading,
}: ClientDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Client</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{clientName}</strong>?
            This will delete their account and all associated data. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : "Remove Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
