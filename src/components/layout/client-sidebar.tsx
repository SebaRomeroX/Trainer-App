"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, History, TrendingUp, MessageSquare, Settings } from "lucide-react"

const links = [
  { href: "/dashboard/client", label: "My Workouts", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/client/history", label: "History", icon: History },
  { href: "/dashboard/client/progress", label: "Progress", icon: TrendingUp },
  { href: "/dashboard/client/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/client/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
]

export function ClientSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100">BodyTrainer</h2>
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
  )
}
