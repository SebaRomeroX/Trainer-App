import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "Trainer Dashboard | Body Trainer App",
    template: "%s | Body Trainer App",
  },
  description: "Manage your clients, routines, and exercises.",
}

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
