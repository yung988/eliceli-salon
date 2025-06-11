import { type NextRequest, NextResponse } from "next/server"
import { createBookingFromCalendar } from "@/app/admin/actions"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const result = await createBookingFromCalendar(formData)

  return NextResponse.json(result)
}
