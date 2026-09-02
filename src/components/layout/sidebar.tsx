import Link from "next/link";
import { LayoutDashboard, User, Settings, Dumbbell } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100">BodyTrainer</h2>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          <li>
            <Link
              className="flex items-center gap-3 rounded-md px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              href="/dashboard/trainer"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              className="flex items-center gap-3 rounded-md px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              href="/dashboard/trainer/exercises"
            >
              <Dumbbell className="h-5 w-5" />
              Exercises
            </Link>
          </li>
          <li>
            <Link
              className="flex items-center gap-3 rounded-md px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              href="/dashboard/client"
            >
              <User className="h-5 w-5" />
              Clients
            </Link>
          </li>
          <li>
            <Link
              className="flex items-center gap-3 rounded-md px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              href="/dashboard/profile"
            >
              <Settings className="h-5 w-5" />
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
