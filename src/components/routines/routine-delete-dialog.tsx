"use client"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"

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
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Routine"
      description={
        <>
          Are you sure you want to delete <strong>{routineName}</strong>? This
          action cannot be undone.
        </>
      }
      confirmLabel="Delete"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  )
}
