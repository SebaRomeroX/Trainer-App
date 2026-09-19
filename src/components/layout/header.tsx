"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import { useAuth } from "@/components/providers/auth-provider"
import { useSidebar } from "./sidebar-context"
import { MobileSidebar } from "./mobile-sidebar"

export function Header() {
  const { user } = useAuth()
  const { open, setOpen } = useSidebar()

  return (
    <>
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <Link
              className="flex items-center gap-2 text-xl font-semibold text-zinc-950 dark:text-zinc-100"
              href="/"
            >
              <span>BodyTrainer</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              className="text-zinc-600 dark:text-zinc-400 hover:underline"
              href={user?.role === "client" ? "/dashboard/client" : "/dashboard/trainer"}
            >
              Dashboard
            </Link>
            <Link
              className="text-zinc-600 dark:text-zinc-400 hover:underline"
              href="/dashboard/profile"
            >
              Profile
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <NotificationDropdown />
          </div>
        </div>
      </header>

      <MobileSidebar />
    </>
  )
}
