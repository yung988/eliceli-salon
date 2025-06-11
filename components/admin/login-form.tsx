"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { adminLogin } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const result = await adminLogin(formData)

    if (result.success) {
      toast({
        title: "Přihlášení úspěšné",
        description: "Byli jste úspěšně přihlášeni do administrace.",
      })
      router.push("/admin/dashboard")
    } else {
      setError(result.error || "Přihlášení se nezdařilo")
      toast({
        title: "Chyba přihlášení",
        description: result.error || "Přihlášení se nezdařilo",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-serif">Administrace</CardTitle>
        <CardDescription>Přihlaste se do administračního rozhraní</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="username">Uživatelské jméno</Label>
            <Input id="username" name="username" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-[#a89b84] hover:bg-[#8c8270]" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Přihlašování...
              </>
            ) : (
              "Přihlásit se"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
