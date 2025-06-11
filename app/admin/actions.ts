"use server"

import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

const sql = neon(process.env.DATABASE_URL!)

// Jednoduchá autentizace pro administrátora
// V produkčním prostředí by měla být použita bezpečnější metoda
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin123" // V produkci použijte silné heslo a hashování

export async function adminLogin(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Nastavení cookie pro autentizaci
    cookies().set("admin_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 den
      path: "/",
    })

    return { success: true }
  }

  return { success: false, error: "Nesprávné přihlašovací údaje" }
}

export async function adminLogout() {
  cookies().delete("admin_auth")
  redirect("/admin")
}

export async function checkAdminAuth() {
  const authCookie = cookies().get("admin_auth")
  return authCookie?.value === "true"
}

// Získání všech rezervací
export async function getBookings(filters?: {
  date?: string
  status?: string
  search?: string
}) {
  try {
    let query = `
      SELECT 
        b.id, 
        b.booking_date, 
        b.start_time, 
        b.end_time, 
        b.status, 
        b.notes,
        c.name as client_name, 
        c.email as client_email, 
        c.phone as client_phone,
        s.name as service_name,
        s.price as service_price
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      JOIN services s ON b.service_id = s.id
    `

    const conditions = []
    const params = []
    let paramIndex = 1

    if (filters?.date) {
      conditions.push(`b.booking_date = $${paramIndex}`)
      params.push(filters.date)
      paramIndex++
    }

    if (filters?.status) {
      conditions.push(`b.status = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }

    if (filters?.search) {
      conditions.push(`(c.name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex})`)
      params.push(`%${filters.search}%`)
      paramIndex++
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ` ORDER BY b.booking_date DESC, b.start_time ASC`

    const bookings = await sql.query(query, params)
    return { success: true, bookings }
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return { success: false, bookings: [] }
  }
}

// Získání detailu rezervace
export async function getBookingDetail(id: number) {
  try {
    const booking = await sql.query(
      `
      SELECT 
        b.id, 
        b.booking_date, 
        b.start_time, 
        b.end_time, 
        b.status, 
        b.notes,
        b.created_at,
        b.updated_at,
        c.id as client_id,
        c.name as client_name, 
        c.email as client_email, 
        c.phone as client_phone,
        s.id as service_id,
        s.name as service_name,
        s.price as service_price,
        s.duration as service_duration
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      JOIN services s ON b.service_id = s.id
      WHERE b.id = $1
    `,
      [id],
    )

    if (booking.length === 0) {
      return { success: false, booking: null, error: "Rezervace nenalezena" }
    }

    return { success: true, booking: booking[0] }
  } catch (error) {
    console.error("Error fetching booking detail:", error)
    return { success: false, booking: null, error: "Chyba při načítání rezervace" }
  }
}

// Aktualizace stavu rezervace
export async function updateBookingStatus(id: number, status: string) {
  try {
    await sql.query(
      `
      UPDATE bookings
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `,
      [status, id],
    )

    revalidatePath("/admin/dashboard/bookings")
    return { success: true }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return { success: false, error: "Chyba při aktualizaci stavu rezervace" }
  }
}

// Smazání rezervace
export async function deleteBooking(id: number) {
  try {
    await sql.query(`DELETE FROM bookings WHERE id = $1`, [id])
    revalidatePath("/admin/dashboard/bookings")
    return { success: true }
  } catch (error) {
    console.error("Error deleting booking:", error)
    return { success: false, error: "Chyba při mazání rezervace" }
  }
}

// Aktualizace rezervace
const updateBookingSchema = z.object({
  id: z.number(),
  booking_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  status: z.string(),
  notes: z.string().optional(),
  client_id: z.number(),
  service_id: z.number(),
})

export async function updateBooking(formData: FormData) {
  try {
    const data = {
      id: Number(formData.get("id")),
      booking_date: formData.get("booking_date") as string,
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
      status: formData.get("status") as string,
      notes: (formData.get("notes") as string) || "",
      client_id: Number(formData.get("client_id")),
      service_id: Number(formData.get("service_id")),
    }

    const validated = updateBookingSchema.parse(data)

    await sql.query(
      `
      UPDATE bookings
      SET 
        booking_date = $1,
        start_time = $2,
        end_time = $3,
        status = $4,
        notes = $5,
        client_id = $6,
        service_id = $7,
        updated_at = NOW()
      WHERE id = $8
    `,
      [
        validated.booking_date,
        validated.start_time,
        validated.end_time,
        validated.status,
        validated.notes,
        validated.client_id,
        validated.service_id,
        validated.id,
      ],
    )

    revalidatePath("/admin/dashboard/bookings")
    return { success: true }
  } catch (error) {
    console.error("Error updating booking:", error)
    return { success: false, error: "Chyba při aktualizaci rezervace" }
  }
}

// Získání všech klientů
export async function getClients(search?: string) {
  try {
    let query = `
      SELECT id, name, email, phone, created_at
      FROM clients
    `

    const params = []
    if (search) {
      query += ` WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1`
      params.push(`%${search}%`)
    }

    query += ` ORDER BY name ASC`

    const clients = await sql.query(query, params)
    return { success: true, clients }
  } catch (error) {
    console.error("Error fetching clients:", error)
    return { success: false, clients: [] }
  }
}

// Získání všech služeb
export async function getServices() {
  try {
    const services = await sql.query(`
      SELECT id, name, description, duration, price
      FROM services
      ORDER BY price ASC
    `)
    return { success: true, services }
  } catch (error) {
    console.error("Error fetching services:", error)
    return { success: false, services: [] }
  }
}

// Získání statistik pro dashboard
export async function getDashboardStats() {
  try {
    // Celkový počet rezervací
    const totalBookings = await sql.query(`SELECT COUNT(*) as count FROM bookings`)

    // Počet rezervací podle stavu
    const bookingsByStatus = await sql.query(`
      SELECT status, COUNT(*) as count 
      FROM bookings 
      GROUP BY status
    `)

    // Počet rezervací na dnešní den
    const today = new Date().toISOString().split("T")[0]
    const todayBookings = await sql.query(
      `
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE booking_date = $1
    `,
      [today],
    )

    // Celkový počet klientů
    const totalClients = await sql.query(`SELECT COUNT(*) as count FROM clients`)

    // Nejpopulárnější služby
    const popularServices = await sql.query(`
      SELECT s.name, COUNT(b.id) as count
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      GROUP BY s.name
      ORDER BY count DESC
      LIMIT 5
    `)

    return {
      success: true,
      stats: {
        totalBookings: totalBookings[0].count,
        bookingsByStatus,
        todayBookings: todayBookings[0].count,
        totalClients: totalClients[0].count,
        popularServices,
      },
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { success: false, stats: null }
  }
}

// Získání rezervací pro kalendářní pohled
export async function getBookingsForCalendar(startDate: string, endDate: string) {
  try {
    const bookings = await sql.query(
      `
      SELECT 
        b.id, 
        b.booking_date, 
        b.start_time, 
        b.end_time, 
        b.status, 
        b.notes,
        c.name as client_name, 
        c.email as client_email, 
        c.phone as client_phone,
        s.name as service_name,
        s.price as service_price,
        s.duration as service_duration
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      JOIN services s ON b.service_id = s.id
      WHERE b.booking_date BETWEEN $1 AND $2
      ORDER BY b.booking_date ASC, b.start_time ASC
    `,
      [startDate, endDate],
    )
    return { success: true, bookings }
  } catch (error) {
    console.error("Error fetching bookings for calendar:", error)
    return { success: false, bookings: [] }
  }
}

// Získání pracovní doby pro kalendářní pohled
export async function getBusinessHours() {
  // V produkčním prostředí by toto bylo načítáno z databáze
  // Pro jednoduchost zde vracíme pevně dané hodnoty
  const businessHours = {
    0: { start: 0, end: 0 }, // Neděle - zavřeno
    1: { start: 9, end: 19 }, // Pondělí
    2: { start: 9, end: 19 }, // Úterý
    3: { start: 9, end: 19 }, // Středa
    4: { start: 9, end: 19 }, // Čtvrtek
    5: { start: 9, end: 19 }, // Pátek
    6: { start: 9, end: 14 }, // Sobota
  }

  return { success: true, businessHours }
}

// Vytvoření nové rezervace z kalendáře
export async function createBookingFromCalendar(formData: FormData) {
  try {
    const clientId = Number(formData.get("client_id"))
    const serviceId = Number(formData.get("service_id"))
    const bookingDate = formData.get("booking_date") as string
    const startTime = formData.get("start_time") as string
    const endTime = formData.get("end_time") as string
    const status = formData.get("status") as string
    const notes = (formData.get("notes") as string) || ""

    // Kontrola, zda klient existuje
    let existingClient

    if (clientId) {
      existingClient = await sql.query(`SELECT id FROM clients WHERE id = $1`, [clientId])
    } else {
      const clientName = formData.get("client_name") as string
      const clientEmail = formData.get("client_email") as string
      const clientPhone = formData.get("client_phone") as string

      // Kontrola, zda klient s tímto emailem již existuje
      existingClient = await sql.query(`SELECT id FROM clients WHERE email = $1`, [clientEmail])

      // Pokud klient neexistuje, vytvoříme nového
      if (existingClient.length === 0) {
        existingClient = await sql.query(`INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING id`, [
          clientName,
          clientEmail,
          clientPhone,
        ])
      }
    }

    // Vytvoření rezervace
    await sql.query(
      `
      INSERT INTO bookings (
        client_id, 
        service_id, 
        booking_date, 
        start_time, 
        end_time, 
        status, 
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [existingClient[0].id, serviceId, bookingDate, startTime, endTime, status, notes],
    )

    revalidatePath("/admin/dashboard/calendar")
    return { success: true, message: "Rezervace byla úspěšně vytvořena" }
  } catch (error) {
    console.error("Error creating booking from calendar:", error)
    return { success: false, error: "Nepodařilo se vytvořit rezervaci" }
  }
}
