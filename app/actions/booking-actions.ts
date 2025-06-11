"use server"

import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const sql = neon(process.env.DATABASE_URL!)

// Define the schema for form validation
const bookingSchema = z.object({
  service: z.string().min(1, "Service is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(9, "Phone must be at least 9 characters"),
  notes: z.string().optional(),
})

export async function createBooking(formData: FormData) {
  try {
    // Validate form data
    const validatedData = bookingSchema.parse({
      service: formData.get("service"),
      date: formData.get("date"),
      time: formData.get("time"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      notes: formData.get("notes") || "",
    })

    // Parse the service ID to get the actual service ID from the database
    const serviceId = Number.parseInt(validatedData.service)

    // Calculate end time based on service duration
    const serviceQuery = await sql`SELECT duration FROM services WHERE id = ${serviceId}`
    const serviceDuration = serviceQuery[0]?.duration || 60 // Default to 60 minutes if not found

    // Parse the time string to create start and end times
    const [hours, minutes] = validatedData.time.split(":").map(Number)
    const startTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    // Calculate end time by adding service duration
    const endTimeDate = new Date()
    endTimeDate.setHours(hours)
    endTimeDate.setMinutes(minutes + serviceDuration)
    const endTime = `${endTimeDate.getHours().toString().padStart(2, "0")}:${endTimeDate.getMinutes().toString().padStart(2, "0")}`

    // First, check if client exists
    const existingClient = await sql`
      SELECT id FROM clients WHERE email = ${validatedData.email}
    `

    let clientId

    if (existingClient.length > 0) {
      // Update existing client
      clientId = existingClient[0].id
      await sql`
        UPDATE clients 
        SET name = ${validatedData.name}, phone = ${validatedData.phone}, updated_at = NOW()
        WHERE id = ${clientId}
      `
    } else {
      // Create new client
      const newClient = await sql`
        INSERT INTO clients (name, email, phone)
        VALUES (${validatedData.name}, ${validatedData.email}, ${validatedData.phone})
        RETURNING id
      `
      clientId = newClient[0].id
    }

    // Create booking
    await sql`
      INSERT INTO bookings (
        client_id, 
        service_id, 
        booking_date, 
        start_time, 
        end_time, 
        status, 
        notes
      )
      VALUES (
        ${clientId}, 
        ${serviceId}, 
        ${validatedData.date}, 
        ${startTime}, 
        ${endTime}, 
        'confirmed', 
        ${validatedData.notes}
      )
    `

    revalidatePath("/")

    return { success: true, message: "Booking created successfully" }
  } catch (error) {
    console.error("Error creating booking:", error)
    return { success: false, message: "Failed to create booking" }
  }
}

export async function getServices() {
  try {
    const services = await sql`
      SELECT id, name, description, duration, price
      FROM services
      ORDER BY price ASC
    `
    return { success: true, services }
  } catch (error) {
    console.error("Error fetching services:", error)
    return { success: false, services: [] }
  }
}

export async function getAvailableTimeSlots(date: string, serviceId: number) {
  try {
    // Get service duration
    const serviceQuery = await sql`SELECT duration FROM services WHERE id = ${serviceId}`
    const serviceDuration = serviceQuery[0]?.duration || 60 // Default to 60 minutes if not found

    // Get existing bookings for the selected date
    const bookings = await sql`
      SELECT start_time, end_time
      FROM bookings
      WHERE booking_date = ${date}
      AND status = 'confirmed'
      ORDER BY start_time ASC
    `

    // Business hours
    const businessHours = {
      0: { start: 0, end: 0 }, // Sunday - closed
      1: { start: 9, end: 19 }, // Monday
      2: { start: 9, end: 19 }, // Tuesday
      3: { start: 9, end: 19 }, // Wednesday
      4: { start: 9, end: 19 }, // Thursday
      5: { start: 9, end: 19 }, // Friday
      6: { start: 9, end: 14 }, // Saturday
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = new Date(date).getDay()
    const hours = businessHours[dayOfWeek as keyof typeof businessHours]

    // If closed on this day
    if (hours.start === 0 && hours.end === 0) {
      return { success: true, timeSlots: [] }
    }

    // Generate available time slots
    const timeSlots = []
    const slotInterval = 30 // 30-minute intervals

    for (let hour = hours.start; hour < hours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

        // Calculate end time
        const endTimeDate = new Date()
        endTimeDate.setHours(hour)
        endTimeDate.setMinutes(minute + serviceDuration)

        // Skip if end time is after business hours
        if (endTimeDate.getHours() >= hours.end) {
          continue
        }

        // Check if slot conflicts with existing bookings
        const isAvailable = !bookings.some((booking) => {
          const bookingStart = booking.start_time
          const bookingEnd = booking.end_time

          // Check if new appointment overlaps with existing booking
          return (
            (startTime >= bookingStart && startTime < bookingEnd) || // New start time is during existing booking
            (endTimeDate.getHours().toString().padStart(2, "0") +
              ":" +
              endTimeDate.getMinutes().toString().padStart(2, "0") >
              bookingStart &&
              startTime < bookingStart) // New appointment spans over existing booking
          )
        })

        if (isAvailable) {
          timeSlots.push(startTime)
        }
      }
    }

    return { success: true, timeSlots }
  } catch (error) {
    console.error("Error fetching available time slots:", error)
    return { success: false, timeSlots: [] }
  }
}
