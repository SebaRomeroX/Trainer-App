"use client"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"

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
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Remove Client"
      description={
        <>
          Are you sure you want to remove <strong>{clientName}</strong>?
          This will delete their account and all associated data. This action
          cannot be undone.
        </>
      }
      confirmLabel="Remove Client"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  )
}
