"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { canAccess } from "@/lib/permissions"
import type { ModuleKey } from "@/lib/types"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Spinner } from "@/components/ui/spinner"

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auth guard + permisos por ruta
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }
    const segment = (pathname?.split("/")[1] ?? "") as ModuleKey
    if (segment && !canAccess(user.role, segment)) {
      // Redirige al primer módulo permitido
      const fallback =
        user.role === "contador" ? "/ingresos" : "/dashboard"
      router.replace(fallback)
    }
  }, [user, loading, pathname, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <Sidebar
        role={user.role}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
