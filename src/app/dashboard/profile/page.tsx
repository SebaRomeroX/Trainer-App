import type { Metadata } from "next"
import { getUser } from "@/lib/dal"

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
          <p className="text-zinc-950 dark:text-zinc-100 capitalize">{user?.role ?? "—"}</p>
        </div>
      </div>
    </div>
  )
}
