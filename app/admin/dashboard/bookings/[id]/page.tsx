import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { getBookingDetail } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, Edit, Mail, Phone, User } from "lucide-react"

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const bookingId = Number.parseInt(params.id)

  if (isNaN(bookingId)) {
    notFound()
  }

  const { success, booking, error } = await getBookingDetail(bookingId)

  if (!success || !booking) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard/bookings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-serif">Detail rezervace</h1>
        </div>
        <p className="text-destructive">{error || "Rezervace nebyla nalezena"}</p>
      </div>
    )
  }

  // Pomocná funkce pro získání textu stavu
  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Potvrzená"
      case "cancelled":
        return "Zrušená"
      case "pending":
        return "Čekající"
      case "completed":
        return "Dokončená"
      default:
        return status
    }
  }

  // Pomocná funkce pro získání barvy stavu
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard/bookings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-serif">Detail rezervace #{booking.id}</h1>
        </div>
        <Button asChild className="bg-[#a89b84] hover:bg-[#8c8270]">
          <Link href={`/admin/dashboard/bookings/${booking.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Upravit rezervaci
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informace o rezervaci</CardTitle>
            <CardDescription>Detaily rezervace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Datum</p>
                <p>{format(new Date(booking.booking_date), "EEEE d. MMMM yyyy", { locale: cs })}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Čas</p>
                <p>
                  {booking.start_time} - {booking.end_time}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Stav</p>
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}
              >
                {getStatusText(booking.status)}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Služba</p>
              <p>{booking.service_name}</p>
              <p className="text-sm text-muted-foreground">
                {booking.service_duration} minut | {booking.service_price} Kč
              </p>
            </div>

            {booking.notes && (
              <div>
                <p className="text-sm font-medium mb-1">Poznámky</p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Vytvořeno: {new Date(booking.created_at).toLocaleString("cs-CZ")}
              </p>
              {booking.updated_at && (
                <p className="text-sm text-muted-foreground">
                  Aktualizováno: {new Date(booking.updated_at).toLocaleString("cs-CZ")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informace o klientovi</CardTitle>
            <CardDescription>Kontaktní údaje klienta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Jméno</p>
                <p>{booking.client_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p>{booking.client_email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Telefon</p>
                <p>{booking.client_phone}</p>
              </div>
            </div>

            <div className="pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/admin/dashboard/clients/${booking.client_id}`}>Zobrazit profil klienta</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
