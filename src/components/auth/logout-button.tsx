"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"

export function LogoutButton() {
  const { logout } = useAuth()

  return (
    <Button
      variant="outline"
      className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950"
      onClick={logout}
    >
      <LogOut className="h-4 w-4" />
      Log Out
    </Button>
  )
}
