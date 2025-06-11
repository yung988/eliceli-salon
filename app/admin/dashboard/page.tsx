import Link from "next/link"
import { getDashboardStats } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users } from "lucide-react"

export default async function DashboardPage() {
  const { success, stats } = await getDashboardStats()

  if (!success || !stats) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-serif">Dashboard</h1>
        <p>Nepodařilo se načíst statistiky.</p>
      </div>
    )
  }

  // Získání počtu potvrzených, zrušených a čekajících rezervací
  const confirmedBookings = stats.bookingsByStatus.find((s) => s.status === "confirmed")?.count || 0
  const cancelledBookings = stats.bookingsByStatus.find((s) => s.status === "cancelled")?.count || 0
  const pendingBookings = stats.bookingsByStatus.find((s) => s.status === "pending")?.count || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-serif">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild className="bg-[#a89b84] hover:bg-[#8c8270]">
            <Link href="/admin/dashboard/bookings">Správa rezervací</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem rezervací</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Dnes: {stats.todayBookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potvrzené rezervace</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((Number(confirmedBookings) / Number(stats.totalBookings)) * 100)}% z celkového počtu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zrušené rezervace</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledBookings}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((Number(cancelledBookings) / Number(stats.totalBookings)) * 100)}% z celkového počtu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem klientů</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nejpopulárnější služby</CardTitle>
            <CardDescription>Top 5 nejčastěji rezervovaných služeb</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularServices.map((service: any) => (
                <div key={service.name} className="flex items-center">
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{service.name}</span>
                      <span className="text-sm text-muted-foreground">{service.count}x</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#a89b84]"
                        style={{
                          width: `${Math.min(100, (Number(service.count) / Number(stats.popularServices[0].count)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dnešní rezervace</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("cs-CZ", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.todayBookings > 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl font-bold">{stats.todayBookings}</p>
                <p className="text-sm text-muted-foreground mt-2">rezervací na dnešní den</p>
                <Button asChild className="mt-4 bg-[#a89b84] hover:bg-[#8c8270]">
                  <Link href="/admin/dashboard/bookings">Zobrazit rezervace</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Žádné rezervace na dnešní den</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
