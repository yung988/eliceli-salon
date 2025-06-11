import { redirect } from "next/navigation"
import { checkAdminAuth } from "./actions"
import { LoginForm } from "@/components/admin/login-form"
import { Toaster } from "@/components/ui/toaster"

export default async function AdminLoginPage() {
  // Kontrola, zda je uživatel již přihlášen
  const isAuthenticated = await checkAdminAuth()

  if (isAuthenticated) {
    redirect("/admin/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2] p-4">
      <LoginForm />
      <Toaster />
    </div>
  )
}
