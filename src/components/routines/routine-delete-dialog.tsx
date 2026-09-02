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

interface RoutineDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  routineName: string
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export function RoutineDeleteDialog({
  open,
  onOpenChange,
  routineName,
  onConfirm,
  isLoading,
}: RoutineDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Routine</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{routineName}</strong>? This
            action cannot be undone.
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
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
