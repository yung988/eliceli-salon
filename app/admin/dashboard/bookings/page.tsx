import { getBookings } from "../../actions"
import { BookingTable } from "@/components/admin/booking-table"

export default async function BookingsPage() {
  const { success, bookings } = await getBookings()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-serif">Správa rezervací</h1>
      <BookingTable bookings={success ? bookings : []} />
    </div>
  )
}
