import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "My Dashboard | Body Trainer App",
    template: "%s | Body Trainer App",
  },
  description: "Track your workouts, progress, and communicate with your trainer.",
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
