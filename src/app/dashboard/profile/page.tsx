import type { Metadata } from "next"
import { getUser } from "@/lib/dal"
import { LogoutButton } from "@/components/auth/logout-button"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Profile | Body Trainer App",
}

export default async function ProfilePage() {
  const user = await getUser()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
        Profile
      </h1>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">Name</p>
          <p className="text-zinc-950 dark:text-zinc-100">{user?.name ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">Email</p>
          <p className="text-zinc-950 dark:text-zinc-100">{user?.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500">Role</p>
          <div className="flex items-center gap-2">
            <p className="text-zinc-950 dark:text-zinc-100 capitalize">{user?.role ?? "—"}</p>
            {user?.isAdmin && (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                <Shield className="mr-1 h-3 w-3" />
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <LogoutButton />
      </div>
    </div>
  )
}
