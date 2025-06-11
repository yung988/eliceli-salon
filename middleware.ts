import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Kontrola, zda je uživatel přihlášen jako admin
  const adminAuth = request.cookies.get("admin_auth")?.value

  // Pokud uživatel přistupuje k admin dashboardu a není přihlášen, přesměrujeme ho na přihlašovací stránku
  if (request.nextUrl.pathname.startsWith("/admin/dashboard") && adminAuth !== "true") {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
