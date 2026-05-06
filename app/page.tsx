"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ROLE_MODULES } from "@/lib/permissions"
import { Spinner } from "@/components/ui/spinner"

export default function RootPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
    } else {
      const first = ROLE_MODULES[user.role][0] ?? "dashboard"
      router.replace(`/${first}`)
    }
  }, [user, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner className="text-primary" />
    </div>
  )
}
