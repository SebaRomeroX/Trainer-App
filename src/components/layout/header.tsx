import Link from "next/link";
import { Menu } from "lucide-react";

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
            href="/dashboard/client"
          >
            Clients
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Menu className="h-5 w-5 text-zinc-500" />
          <span className="text-zinc-500 text-sm">Menu</span>
        </div>
      </div>
    </header>
  );
}
