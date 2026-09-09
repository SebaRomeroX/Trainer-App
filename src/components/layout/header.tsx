import Link from "next/link";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

export function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
        <Link
          className="flex items-center gap-2 text-xl font-semibold text-zinc-950 dark:text-zinc-100"
          href="/"
        >
          <span>BodyTrainer</span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link
            className="text-zinc-600 dark:text-zinc-400 hover underline"
            href="/dashboard/trainer"
          >
            Dashboard
          </Link>
          <Link
            className="text-zinc-600 dark:text-zinc-400 hover underline"
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
  );
}
