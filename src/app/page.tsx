import Link from "next/link"
import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await verifySession()

  if (session) {
    redirect(
      session.role === "trainer" ? "/dashboard/trainer" : "/dashboard/client"
    )
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans">
      <main className="flex flex-col items-center gap-8 text-center px-6 py-32">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 sm:text-5xl">
          Body Trainer App
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          A trainer-client fitness platform for exercise creation, routine
          management, and progress tracking.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-zinc-950 dark:bg-zinc-100 px-6 py-3 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-300"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-950 dark:text-zinc-100 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Create Account
          </Link>
        </div>
      </main>
    </div>
  )
}
