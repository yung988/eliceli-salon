"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, CalendarDays, Home, LogOut, Settings, Users } from "lucide-react"
import { adminLogout } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await adminLogout()
    router.push("/admin")
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="p-2">
          <h2 className="text-xl font-serif">Administrace</h2>
          <p className="text-sm text-muted-foreground">Správa salonu</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/admin/dashboard"}>
              <Link href="/admin/dashboard">
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.includes("/admin/dashboard/calendar")}>
              <Link href="/admin/dashboard/calendar">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>Kalendář</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={
                pathname.includes("/admin/dashboard/bookings") && !pathname.includes("/admin/dashboard/calendar")
              }
            >
              <Link href="/admin/dashboard/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Rezervace</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.includes("/admin/dashboard/clients")}>
              <Link href="/admin/dashboard/clients">
                <Users className="mr-2 h-4 w-4" />
                <span>Klienti</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.includes("/admin/dashboard/settings")}>
              <Link href="/admin/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Nastavení</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Odhlásit se</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
