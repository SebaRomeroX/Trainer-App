"use client"

import { useActionState, useEffect, useRef } from "react"
import { changePassword } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        {state?.errors?.currentPassword && (
          <p className="text-sm text-red-500">
            {state.errors.currentPassword[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {state?.errors?.newPassword && (
          <p className="text-sm text-red-500">{state.errors.newPassword[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {state?.errors?.confirmPassword && (
          <p className="text-sm text-red-500">
            {state.errors.confirmPassword[0]}
          </p>
        )}
      </div>

      <p className="text-sm text-zinc-500">
        At least 8 characters, including a letter and a number.
      </p>

      {state?.message && (
        <p
          className={`text-sm ${
            state.success ? "text-green-600" : "text-red-500"
          }`}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  )
}
