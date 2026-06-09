"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Users,
  UsersRound,
  X,
  Home,
  ListTodo,
  Calculator,
} from "lucide-react"
import type { ComponentType } from "react"
import { ROLE_MODULES } from "@/lib/permissions"
import type { ModuleKey, Role } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface NavItem {
  key: ModuleKey
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  group: "Principal" | "Finanzas" | "Administración"
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard",      label: "Dashboard",      href: "/dashboard",      icon: LayoutDashboard, group: "Principal" },
  { key: "clientes",       label: "Clientes",       href: "/clientes",       icon: UsersRound,      group: "Principal" },
  { key: "conversaciones", label: "Conversaciones", href: "/conversaciones", icon: MessageSquare,   group: "Principal" },
  { key: "agenda",         label: "Agenda",         href: "/agenda",         icon: CalendarDays,    group: "Principal" },
  { key: "tareas",         label: "Tareas",         href: "/tareas",         icon: ListTodo,        group: "Principal" },
  { key: "terrenos",       label: "Catálogo",       href: "/terrenos",       icon: Home,            group: "Principal" },
  { key: "ingresos",       label: "Ingresos",       href: "/ingresos",       icon: TrendingUp,      group: "Finanzas"  },
  { key: "egresos",        label: "Egresos",        href: "/egresos",        icon: TrendingDown,    group: "Finanzas"  },
  { key: "arqueo",         label: "Arqueo de Caja", href: "/arqueo",         icon: Calculator,      group: "Finanzas"  },
  { key: "reportes",       label: "Reportes",       href: "/reportes",       icon: ReceiptText,     group: "Finanzas"  },
  { key: "usuarios",       label: "Usuarios",       href: "/usuarios",       icon: Users,           group: "Administración" },
]

interface SidebarProps {
  role: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ role, open, onOpenChange }: SidebarProps) {
  const allowed = ROLE_MODULES[role]
  const items = NAV_ITEMS.filter((i) => allowed.includes(i.key))

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <SidebarContent items={items} />
      </aside>

      {/* Mobile / tablet */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
          <SheetDescription className="sr-only">Enlaces principales del sistema</SheetDescription>
          <div className="flex items-center justify-end p-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarContent items={items} onNavigate={() => onOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

function SidebarContent({
  items,
  onNavigate,
}: {
  items: NavItem[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const groups = Array.from(new Set(items.map((i) => i.group)))

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:ring-brand-500/20">
          <Image
            src="/logo.png"
            alt="Luz del Sol"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">Luz del Sol</p>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Inmobiliaria
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {groups.map((group) => (
          <div key={group} className="mb-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group}
            </p>
            <ul className="space-y-1">
              {items
                .filter((i) => i.group === group)
                .map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href || pathname?.startsWith(item.href + "/")
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active
                              ? "text-brand-500 dark:text-brand-400"
                              : "text-muted-foreground group-hover:text-foreground",
                          )}
                        />
                        <span>{item.label}</span>
                        {active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-brand-400" />
                        )}
                      </Link>
                    </li>
                  )
                })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-[11px] text-muted-foreground">
          v1.0 · Panel administrativo
        </p>
      </div>
    </div>
  )
}
