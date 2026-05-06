"use client"

import { usePathname, useRouter } from "next/navigation"
import { Bell, LogOut, Menu, Search, User as UserIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ROLE_LABELS } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  conversaciones: "Conversaciones",
  agenda: "Agenda",
  ingresos: "Ingresos",
  egresos: "Egresos",
  reportes: "Reportes",
  usuarios: "Gestión de Usuarios",
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const segment = pathname?.split("/")[1] ?? ""
  const title = PAGE_TITLES[segment] ?? "Panel"

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  const initials =
    user?.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?"

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
          {title}
        </h1>
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="h-9 w-64 pl-8"
            aria-label="Buscar"
          />
        </div>
      </div>

      <Button variant="outline" size="icon" className="relative rounded-full" aria-label="Notificaciones">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
      </Button>

      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-full pl-1 pr-3 transition hover:bg-muted"
            aria-label="Menú de usuario"
          >
            <Avatar className="h-8 w-8 border border-brand-100 dark:border-brand-500/30">
              <AvatarFallback className="bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-medium leading-tight text-foreground">{user?.name}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {user ? ROLE_LABELS[user.role] : ""}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              <Badge
                variant="outline"
                className="mt-1.5 w-fit border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200"
              >
                {user ? ROLE_LABELS[user.role] : ""}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <UserIcon className="h-4 w-4" /> Mi perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
