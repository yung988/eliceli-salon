import type React from "react"
import type { Metadata } from "next"
import { AdminSidebar } from "@/components/admin/sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Admin Dashboard | Madero Therapy & Lymfomodeling",
  description: "Administrační rozhraní pro správu rezervací a klientů",
}

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <div className="flex flex-col min-h-screen">
        <header className="h-14 border-b flex items-center px-4">
          <SidebarTrigger />
          <h1 className="ml-4 text-lg font-medium">Administrace</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
