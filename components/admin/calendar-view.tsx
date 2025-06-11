"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  getDay,
  getDaysInMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns"
import { cs } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, User } from "lucide-react"
import { getBookingsForCalendar, getBusinessHours, getClients, getServices } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
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
  service_duration: number
}

type BusinessHours = {
  [key: number]: { start: number; end: number }
}

type Client = {
  id: number
  name: string
  email: string
  phone: string
}

type Service = {
  id: number
  name: string
  description: string
  duration: number
  price: number
}

export function CalendarView() {
  const [view, setView] = useState<"day" | "week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [businessHours, setBusinessHours] = useState<BusinessHours>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isNewBookingDialogOpen, setIsNewBookingDialogOpen] = useState(false)
  const [newBookingDate, setNewBookingDate] = useState("")
  const [newBookingTime, setNewBookingTime] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedService, setSelectedService] = useState<string>("")
  const [isNewClient, setIsNewClient] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")
  const [bookingNotes, setBookingNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Načtení dat při změně pohledu nebo data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        // Určení rozsahu dat podle aktuálního pohledu
        let startDate, endDate

        if (view === "day") {
          startDate = format(currentDate, "yyyy-MM-dd")
          endDate = format(currentDate, "yyyy-MM-dd")
        } else if (view === "week") {
          const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Pondělí jako první den týdne
          startDate = format(start, "yyyy-MM-dd")
          endDate = format(addDays(start, 6), "yyyy-MM-dd")
        } else {
          const start = startOfMonth(currentDate)
          startDate = format(start, "yyyy-MM-dd")
          endDate = format(addDays(start, getDaysInMonth(currentDate) - 1), "yyyy-MM-dd")
        }

        // Načtení rezervací
        const bookingsResult = await getBookingsForCalendar(startDate, endDate)
        if (bookingsResult.success) {
          setBookings(bookingsResult.bookings as Booking[])
        }

        // Načtení pracovní doby
        const businessHoursResult = await getBusinessHours()
        if (businessHoursResult.success) {
          setBusinessHours(businessHoursResult.businessHours)
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [view, currentDate])

  // Načtení klientů a služeb pro dialog nové rezervace
  useEffect(() => {
    const fetchClientsAndServices = async () => {
      const clientsResult = await getClients()
      if (clientsResult.success) {
        setClients(clientsResult.clients as Client[])
      }

      const servicesResult = await getServices()
      if (servicesResult.success) {
        setServices(servicesResult.services as Service[])
      }
    }

    if (isNewBookingDialogOpen) {
      fetchClientsAndServices()
    }
  }, [isNewBookingDialogOpen])

  // Kontrola URL parametrů při načtení komponenty
  useEffect(() => {
    if (searchParams) {
      const viewParam = searchParams.get("view")
      const dateParam = searchParams.get("date")

      if (viewParam && ["day", "week", "month"].includes(viewParam)) {
        setView(viewParam as "day" | "week" | "month")
      }

      if (dateParam) {
        try {
          const parsedDate = parseISO(dateParam)
          setCurrentDate(parsedDate)
        } catch (error) {
          console.error("Invalid date parameter:", error)
        }
      }
    }
  }, [searchParams])

  // Aktualizace URL při změně pohledu nebo data
  useEffect(() => {
    if (typeof window !== 'undefined' && router) {
      const params = new URLSearchParams()
      params.set("view", view)
      params.set("date", format(currentDate, "yyyy-MM-dd"))

      router.replace(`/admin/dashboard/calendar?${params.toString()}`)
    }
  }, [view, currentDate, router])

  // Navigace v kalendáři
  const navigatePrevious = () => {
    if (view === "day") {
      setCurrentDate(subDays(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const navigateNext = () => {
    if (view === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  // Formátování nadpisu kalendáře
  const getCalendarTitle = () => {
    if (view === "day") {
      return format(currentDate, "EEEE d. MMMM yyyy", { locale: cs })
    } else if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = addDays(start, 6)

      if (start.getMonth() === end.getMonth()) {
        return `${format(start, "d.")} - ${format(end, "d. MMMM yyyy", { locale: cs })}`
      } else if (start.getFullYear() === end.getFullYear()) {
        return `${format(start, "d. MMMM")} - ${format(end, "d. MMMM yyyy", { locale: cs })}`
      } else {
        return `${format(start, "d. MMMM yyyy")} - ${format(end, "d. MMMM yyyy", { locale: cs })}`
      }
    } else {
      return format(currentDate, "LLLL yyyy", { locale: cs })
    }
  }

  // Získání barvy podle stavu rezervace
  const getBookingColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 border-green-500 text-green-800"
      case "cancelled":
        return "bg-red-100 border-red-500 text-red-800"
      case "pending":
        return "bg-yellow-100 border-yellow-500 text-yellow-800"
      case "completed":
        return "bg-blue-100 border-blue-500 text-blue-800"
      default:
        return "bg-gray-100 border-gray-500 text-gray-800"
    }
  }

  // Vytvoření nové rezervace
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Výpočet koncového času na základě trvání služby
      const selectedServiceObj = services.find((s) => s.id.toString() === selectedService)
      if (!selectedServiceObj) {
        toast({
          title: "Chyba",
          description: "Vyberte prosím službu",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const [hours, minutes] = newBookingTime.split(":").map(Number)
      const startDate = new Date()
      startDate.setHours(hours, minutes, 0, 0)

      const endDate = new Date(startDate)
      endDate.setMinutes(endDate.getMinutes() + selectedServiceObj.duration)

      const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`

      const formData = new FormData()

      if (isNewClient) {
        formData.append("client_name", newClientName)
        formData.append("client_email", newClientEmail)
        formData.append("client_phone", newClientPhone)
      } else {
        formData.append("client_id", selectedClient)
      }

      formData.append("service_id", selectedService)
      formData.append("booking_date", newBookingDate)
      formData.append("start_time", newBookingTime)
      formData.append("end_time", endTime)
      formData.append("status", "confirmed")
      formData.append("notes", bookingNotes)

      const result = await fetch("/admin/api/bookings", {
        method: "POST",
        body: formData,
      }).then((res) => res.json())

      if (result.success) {
        toast({
          title: "Úspěch",
          description: "Rezervace byla úspěšně vytvořena",
        })

        // Aktualizace seznamu rezervací
        const updatedBookingsResult = await getBookingsForCalendar(
          format(currentDate, "yyyy-MM-dd"),
          format(currentDate, "yyyy-MM-dd"),
        )
        if (updatedBookingsResult.success) {
          setBookings(updatedBookingsResult.bookings as Booking[])
        }

        // Zavření dialogu a reset formuláře
        setIsNewBookingDialogOpen(false)
        resetNewBookingForm()
      } else {
        toast({
          title: "Chyba",
          description: result.error || "Nepodařilo se vytvořit rezervaci",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se vytvořit rezervaci",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset formuláře pro novou rezervaci
  const resetNewBookingForm = () => {
    setSelectedClient("")
    setSelectedService("")
    setIsNewClient(false)
    setNewClientName("")
    setNewClientEmail("")
    setNewClientPhone("")
    setBookingNotes("")
  }

  // Otevření dialogu pro novou rezervaci
  const openNewBookingDialog = (date: string, time: string) => {
    setNewBookingDate(date)
    setNewBookingTime(time)
    setIsNewBookingDialogOpen(true)
  }

  // Renderování denního pohledu
  const renderDayView = () => {
    const date = format(currentDate, "yyyy-MM-dd")
    const dayOfWeek = getDay(currentDate)
    const hours = businessHours[dayOfWeek] || { start: 0, end: 0 }

    // Pokud je zavřeno
    if (hours.start === 0 && hours.end === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Zavřeno</p>
        </div>
      )
    }

    // Vytvoření časových slotů
    const timeSlots = []
    for (let hour = hours.start; hour < hours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        timeSlots.push(time)
      }
    }

    // Filtrování rezervací pro aktuální den
    const dayBookings = bookings.filter((booking) => booking.booking_date === date)

    return (
      <div className="space-y-2">
        {timeSlots.map((time) => {
          const slotBookings = dayBookings.filter((booking) => booking.start_time === time)

          return (
            <div key={time} className="flex items-start gap-2">
              <div className="w-16 text-sm text-gray-500 pt-2">{time}</div>
              <div className="flex-1 min-h-[60px] border rounded-lg p-1 bg-gray-50 relative">
                {slotBookings.length > 0 ? (
                  slotBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`p-2 rounded border-l-4 mb-1 cursor-pointer ${getBookingColor(booking.status)}`}
                      onClick={() => {
                        setSelectedBooking(booking)
                        setIsBookingDialogOpen(true)
                      }}
                    >
                      <div className="flex justify-between text-sm font-medium">
                        <span>{booking.client_name}</span>
                        <span>
                          {booking.start_time} - {booking.end_time}
                        </span>
                      </div>
                      <div className="text-xs">{booking.service_name}</div>
                    </div>
                  ))
                ) : (
                  <button
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => openNewBookingDialog(date, time)}
                  >
                    <span className="flex items-center gap-1 text-sm text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm border">
                      <Plus className="h-3 w-3" /> Přidat rezervaci
                    </span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Renderování týdenního pohledu
  const renderWeekView = () => {
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeekDate, i))

    // Určení pracovní doby pro celý týden
    let earliestStart = 24
    let latestEnd = 0

    days.forEach((day) => {
      const dayOfWeek = getDay(day)
      const hours = businessHours[dayOfWeek] || { start: 0, end: 0 }

      if (hours.start > 0 && hours.start < earliestStart) {
        earliestStart = hours.start
      }

      if (hours.end > latestEnd) {
        latestEnd = hours.end
      }
    })

    // Vytvoření časových slotů
    const timeSlots = []
    for (let hour = earliestStart; hour < latestEnd; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        timeSlots.push(time)
      }
    }

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hlavička s dny */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-sm text-gray-500"></div>
            {days.map((day, index) => {
              const isCurrentDay = isToday(day)
              const dayOfWeek = getDay(day)
              const isClosed = businessHours[dayOfWeek]?.start === 0 && businessHours[dayOfWeek]?.end === 0

              return (
                <div
                  key={index}
                  className={`text-center p-2 rounded-t-lg ${
                    isCurrentDay ? "bg-blue-50 font-medium" : ""
                  } ${isClosed ? "bg-gray-100" : ""}`}
                >
                  <div className="text-sm font-medium">{format(day, "EEEE", { locale: cs })}</div>
                  <div className={`text-lg ${isCurrentDay ? "text-blue-600" : ""}`}>{format(day, "d.M.")}</div>
                </div>
              )
            })}
          </div>

          {/* Časové sloty */}
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 gap-2 mb-1">
              <div className="text-sm text-gray-500 pt-2">{time}</div>
              {days.map((day, index) => {
                const date = format(day, "yyyy-MM-dd")
                const dayOfWeek = getDay(day)
                const hours = businessHours[dayOfWeek] || { start: 0, end: 0 }
                const isClosed = hours.start === 0 && hours.end === 0
                const isOutsideHours =
                  Number.parseInt(time.split(":")[0]) < hours.start || Number.parseInt(time.split(":")[0]) >= hours.end

                // Filtrování rezervací pro aktuální den a čas
                const slotBookings = bookings.filter(
                  (booking) => booking.booking_date === date && booking.start_time === time,
                )

                if (isClosed || isOutsideHours) {
                  return <div key={index} className="h-12 bg-gray-100 rounded"></div>
                }

                return (
                  <div key={index} className="min-h-[48px] border rounded p-1 bg-gray-50 relative">
                    {slotBookings.length > 0 ? (
                      slotBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`p-1 rounded border-l-4 text-xs cursor-pointer ${getBookingColor(booking.status)}`}
                          onClick={() => {
                            setSelectedBooking(booking)
                            setIsBookingDialogOpen(true)
                          }}
                        >
                          <div className="font-medium truncate">{booking.client_name}</div>
                          <div className="truncate">{booking.service_name}</div>
                        </div>
                      ))
                    ) : (
                      <button
                        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => openNewBookingDialog(date, time)}
                      >
                        <Plus className="h-3 w-3 text-gray-500" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Renderování měsíčního pohledu
  const renderMonthView = () => {
    const startDate = startOfMonth(currentDate)
    const startDayOfWeek = getDay(startDate)
    const daysInMonth = getDaysInMonth(currentDate)

    // Vytvoření pole dnů pro zobrazení
    const days = []

    // Přidání dnů z předchozího měsíce pro vyplnění prvního týdne
    const prevMonthDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1
    for (let i = prevMonthDays; i > 0; i--) {
      days.push({
        date: subDays(startDate, i),
        isCurrentMonth: false,
      })
    }

    // Přidání dnů aktuálního měsíce
    for (let i = 0; i < daysInMonth; i++) {
      days.push({
        date: addDays(startDate, i),
        isCurrentMonth: true,
      })
    }

    // Přidání dnů následujícího měsíce pro vyplnění posledního týdne
    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: addDays(addDays(startDate, daysInMonth - 1), i),
          isCurrentMonth: false,
        })
      }
    }

    // Rozdělení dnů do týdnů
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Hlavička s dny v týdnu */}
        {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day, index) => (
          <div key={index} className="text-center font-medium text-sm p-2">
            {day}
          </div>
        ))}

        {/* Dny v měsíci */}
        {weeks.flat().map((day, index) => {
          const date = format(day.date, "yyyy-MM-dd")
          const dayBookings = bookings.filter((booking) => booking.booking_date === date)
          const dayOfWeek = getDay(day.date)
          const isClosed = businessHours[dayOfWeek]?.start === 0 && businessHours[dayOfWeek]?.end === 0

          return (
            <div
              key={index}
              className={`min-h-[100px] border rounded p-1 ${
                !day.isCurrentMonth ? "bg-gray-100 text-gray-400" : ""
              } ${isToday(day.date) ? "bg-blue-50 border-blue-200" : ""} ${
                isClosed && day.isCurrentMonth ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm ${isToday(day.date) ? "font-bold text-blue-600" : ""}`}>
                  {format(day.date, "d")}
                </span>
                {day.isCurrentMonth && !isClosed && (
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => openNewBookingDialog(date, "09:00")}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {dayBookings.length > 0 ? (
                  dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className={`p-1 rounded border-l-2 text-xs cursor-pointer ${getBookingColor(booking.status)}`}
                      onClick={() => {
                        setSelectedBooking(booking)
                        setIsBookingDialogOpen(true)
                      }}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium truncate">{booking.start_time}</span>
                      </div>
                      <div className="truncate">{booking.client_name}</div>
                    </div>
                  ))
                ) : day.isCurrentMonth && !isClosed ? (
                  <div className="text-xs text-gray-400 text-center py-2">Žádné rezervace</div>
                ) : null}

                {dayBookings.length > 3 && (
                  <div className="text-xs text-center text-gray-500">+ {dayBookings.length - 3} další</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-serif">Kalendář rezervací</h1>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={navigateToday}>
            Dnes
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-medium">{getCalendarTitle()}</h2>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}> 
            <TabsList>
              <TabsTrigger value="day">Den</TabsTrigger>
              <TabsTrigger value="week">Týden</TabsTrigger>
              <TabsTrigger value="month">Měsíc</TabsTrigger>
            </TabsList>
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Načítání kalendáře...</p>
              </div>
            ) : (
              <>
                <TabsContent value="day" className="mt-0">
                  {renderDayView()}
                </TabsContent>
                <TabsContent value="week" className="mt-0">
                  {renderWeekView()}
                </TabsContent>
                <TabsContent value="month" className="mt-0">
                  {renderMonthView()}
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog pro zobrazení detailu rezervace */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail rezervace</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Datum</Label>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.booking_date), "EEEE d. MMMM yyyy", { locale: cs })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Čas</Label>
                  <p className="font-medium">
                    {selectedBooking.start_time} - {selectedBooking.end_time}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-500">Klient</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">{selectedBooking.client_name}</p>
                </div>
                <div className="text-sm text-gray-500 ml-6">
                  {selectedBooking.client_email} | {selectedBooking.client_phone}
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-500">Služba</Label>
                <p className="font-medium">{selectedBooking.service_name}</p>
                <p className="text-sm text-gray-500">
                  {selectedBooking.service_duration} minut | {selectedBooking.service_price} Kč
                </p>
              </div>

              {selectedBooking.notes && (
                <div>
                  <Label className="text-sm text-gray-500">Poznámky</Label>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                  Zavřít
                </Button>
                <Button
                  className="bg-[#a89b84] hover:bg-[#8c8270]"
                  onClick={() => {
                    setIsBookingDialogOpen(false)
                    router.push(`/admin/dashboard/bookings/${selectedBooking.id}`)
                  }}
                >
                  Zobrazit detail
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pro vytvoření nové rezervace */}
      <Dialog open={isNewBookingDialogOpen} onOpenChange={setIsNewBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nová rezervace</DialogTitle>
            <DialogDescription>
              {newBookingDate && format(parseISO(newBookingDate), "EEEE d. MMMM yyyy", { locale: cs })}
              {newBookingTime && ` v ${newBookingTime}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service">Služba</Label>
              <Select value={selectedService} onValueChange={setSelectedService} required>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Vyberte službu" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} ({service.duration} min) - {service.price} Kč
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="client">Klient</Label>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setIsNewClient(!isNewClient)}
                >
                  {isNewClient ? "Vybrat existujícího klienta" : "Přidat nového klienta"}
                </button>
              </div>

              {isNewClient ? (
                <div className="space-y-2">
                  <Input
                    id="client-name"
                    placeholder="Jméno a příjmení"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    required
                  />
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="Email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    required
                  />
                  <Input
                    id="client-phone"
                    placeholder="Telefon"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <Select value={selectedClient} onValueChange={setSelectedClient} required={!isNewClient}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Vyberte klienta" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} ({client.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Poznámky</Label>
              <Textarea
                id="notes"
                placeholder="Poznámky k rezervaci"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewBookingDialogOpen(false)}
                disabled={isSubmitting}
              >
                Zrušit
              </Button>
              <Button type="submit" className="bg-[#a89b84] hover:bg-[#8c8270]" disabled={isSubmitting}>
                {isSubmitting ? "Vytváření..." : "Vytvořit rezervaci"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
