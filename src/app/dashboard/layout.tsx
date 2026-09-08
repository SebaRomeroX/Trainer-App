import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ClientSidebar } from "@/components/layout/client-sidebar"
import { Footer } from "@/components/layout/footer"
import { verifySession } from "@/lib/dal"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()
  const role = session?.role ?? "trainer"

  return (
    <div className="flex min-h-screen">
      {role === "client" ? <ClientSidebar /> : <Sidebar />}
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
