import { Suspense } from "react"
import { CalendarView } from "@/components/admin/calendar-view"

function CalendarPageContent() {
  return (
    <div className="space-y-4">
      <CalendarView />
    </div>
  )
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Načítání kalendáře...</p>
      </div>
    }>
      <CalendarPageContent />
    </Suspense>
  )
}
