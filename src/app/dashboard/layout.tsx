import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ClientSidebar } from "@/components/layout/client-sidebar"
import { Footer } from "@/components/layout/footer"
import { SidebarProvider } from "@/components/layout/sidebar-context"
import { verifySession } from "@/lib/dal"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()
  if (!session) redirect("/login")

  const role = session.role

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-950 focus:shadow-lg"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          {role === "client" ? <ClientSidebar /> : <Sidebar />}
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main id="main-content" className="flex-1 p-4 sm:p-6">{children}</main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  )
}
