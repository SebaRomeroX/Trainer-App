"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { useSidebar } from "./sidebar-context"
import {
  LayoutDashboard,
  Users,
  Settings,
  Dumbbell,
  ListOrdered,
  MessageSquare,
  History,
  TrendingUp,
  X,
} from "lucide-react"
import Link from "next/link"

const trainerLinks = [
  { href: "/dashboard/trainer", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/trainer/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/dashboard/trainer/routines", label: "Routines", icon: ListOrdered },
  { href: "/dashboard/trainer/clients", label: "Clients", icon: Users },
  { href: "/dashboard/trainer/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
]

const clientLinks = [
  { href: "/dashboard/client", label: "My Workouts", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/client/history", label: "History", icon: History },
  { href: "/dashboard/client/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/client/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/client/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
]

export function MobileSidebar() {
  const { open, setOpen } = useSidebar()
  const pathname = usePathname()
  const { user } = useAuth()

  const links = user?.role === "client" ? clientLinks : trainerLinks

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100">BodyTrainer</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <nav className="flex-1 p-2">
          <ul className="space-y-2">
            {links.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href)
              return (
                <li key={link.href}>
                  <Link
                    className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 font-medium"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </div>
  )
}
