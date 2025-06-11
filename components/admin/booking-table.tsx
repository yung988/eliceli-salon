"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { Calendar, Check, Edit, Eye, Filter, MoreHorizontal, Search, Trash, X } from "lucide-react"
import { deleteBooking, updateBookingStatus } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

type Booking = {
  id: number
  booking_date: string
  start_time: string
  end_time: string
  status: string
  notes: string
  client_name: string
  client_email: string
  client_phone: string
  service_name: string
  service_price: number
}

type BookingTableProps = {
  bookings: Booking[]
}

export function BookingTable({ bookings }: BookingTableProps) {
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(bookings)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>("") // Updated default value
  const [dateFilter, setDateFilter] = useState<Date | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Aplikace filtrů
  const applyFilters = () => {
    let result = [...bookings]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (booking) =>
          booking.client_name.toLowerCase().includes(term) ||
          booking.client_email.toLowerCase().includes(term) ||
          booking.client_phone.toLowerCase().includes(term) ||
          booking.service_name.toLowerCase().includes(term),
      )
    }

    if (statusFilter) {
      result = result.filter((booking) => booking.status === statusFilter)
    }

    if (dateFilter) {
      const filterDate = format(dateFilter, "yyyy-MM-dd")
      result = result.filter((booking) => booking.booking_date === filterDate)
    }

    setFilteredBookings(result)
  }

  // Reset filtrů
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("") // Updated default value
    setDateFilter(null)
    setFilteredBookings(bookings)
  }

  // Změna stavu rezervace
  const handleStatusChange = async (id: number, status: string) => {
    setIsLoading(true)
    const result = await updateBookingStatus(id, status)

    if (result.success) {
      // Aktualizace stavu v lokálním stavu
      const updatedBookings = filteredBookings.map((booking) => (booking.id === id ? { ...booking, status } : booking))
      setFilteredBookings(updatedBookings)

      toast({
        title: "Stav rezervace byl aktualizován",
        description: `Rezervace byla označena jako ${getStatusText(status)}`,
      })
    } else {
      toast({
        title: "Chyba",
        description: result.error || "Nepodařilo se aktualizovat stav rezervace",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  // Smazání rezervace
  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return

    setIsLoading(true)
    const result = await deleteBooking(bookingToDelete)

    if (result.success) {
      // Odstranění rezervace z lokálního stavu
      const updatedBookings = filteredBookings.filter((booking) => booking.id !== bookingToDelete)
      setFilteredBookings(updatedBookings)

      toast({
        title: "Rezervace byla smazána",
        description: "Rezervace byla úspěšně odstraněna",
      })
    } else {
      toast({
        title: "Chyba",
        description: result.error || "Nepodařilo se smazat rezervaci",
        variant: "destructive",
      })
    }

    setIsDeleteDialogOpen(false)
    setBookingToDelete(null)
    setIsLoading(false)
  }

  // Pomocná funkce pro získání textu stavu
  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "potvrzená"
      case "cancelled":
        return "zrušená"
      case "pending":
        return "čekající"
      case "completed":
        return "dokončená"
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Hledat..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtry
                {(statusFilter || dateFilter) && <span className="ml-1 rounded-full bg-primary w-2 h-2" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Filtry</h4>
                <div className="space-y-2">
                  <Label htmlFor="status">Stav rezervace</Label>
                  <Select
                    value={statusFilter || ""}
                    onValueChange={(value) => setStatusFilter(value || "")} // Updated default value
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Všechny stavy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Všechny stavy</SelectItem>
                      <SelectItem value="confirmed">Potvrzené</SelectItem>
                      <SelectItem value="cancelled">Zrušené</SelectItem>
                      <SelectItem value="pending">Čekající</SelectItem>
                      <SelectItem value="completed">Dokončené</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Datum rezervace</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, "PPP", { locale: cs }) : <span>Vyberte datum</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={dateFilter || undefined}
                        onSelect={setDateFilter}
                        initialFocus
                        locale={cs}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button onClick={applyFilters} className="bg-[#a89b84] hover:bg-[#8c8270]">
                    Použít filtry
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button asChild className="bg-[#a89b84] hover:bg-[#8c8270]">
          <Link href="/admin/dashboard/bookings/new">Nová rezervace</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Klient</TableHead>
              <TableHead>Služba</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Čas</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nebyly nalezeny žádné rezervace
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.client_name}</div>
                    <div className="text-sm text-muted-foreground">{booking.client_email}</div>
                  </TableCell>
                  <TableCell>{booking.service_name}</TableCell>
                  <TableCell>{format(new Date(booking.booking_date), "d. M. yyyy", { locale: cs })}</TableCell>
                  <TableCell>
                    {booking.start_time} - {booking.end_time}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}
                    >
                      {getStatusText(booking.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Otevřít menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/dashboard/bookings/${booking.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Zobrazit detail</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/dashboard/bookings/${booking.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Upravit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={booking.status === "confirmed"}
                          onSelect={() => handleStatusChange(booking.id, "confirmed")}
                        >
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                          <span>Potvrdit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={booking.status === "cancelled"}
                          onSelect={() => handleStatusChange(booking.id, "cancelled")}
                        >
                          <X className="mr-2 h-4 w-4 text-red-600" />
                          <span>Zrušit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => {
                            setBookingToDelete(booking.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Smazat</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog pro potvrzení smazání */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Smazat rezervaci</DialogTitle>
            <DialogDescription>Opravdu chcete smazat tuto rezervaci? Tato akce je nevratná.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Zrušit
            </Button>
            <Button variant="destructive" onClick={handleDeleteBooking} disabled={isLoading}>
              {isLoading ? "Mazání..." : "Smazat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
