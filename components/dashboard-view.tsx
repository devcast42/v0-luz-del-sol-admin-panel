"use client"

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  DollarSign,
  Home,
  UsersRound,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DashboardProps {
  stats: {
    clients: number
    projects: number
    appointments: number
    revenue: number
  }
  flujoMensual: { mes: string; ingresos: number; egresos: number }[]
  ventasMes: { mes: string; ventas: number }[]
  proximasCitas: any[]
  clientesRecientes: any[]
}

export function DashboardView({ stats, flujoMensual, ventasMes, proximasCitas, clientesRecientes }: DashboardProps) {
  const kpis = [
    { label: "Clientes registrados", value: stats.clients.toString(), delta: "+10%", up: true,  icon: UsersRound },
    { label: "Propiedades", value: stats.projects.toString(), delta: "+1", up: true,  icon: Home },
    { label: "Citas próximas", value: stats.appointments.toString(), delta: "+2", up: true, icon: CalendarDays },
    { label: "Ingresos del mes", value: `S/ ${stats.revenue.toLocaleString('es-PE')}`, delta: "+5.4%", up: true, icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
          Resumen general
        </h2>
        <p className="text-sm text-muted-foreground">
          Vista rápida del rendimiento de Luz del Sol basado en datos reales.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{s.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div
                  className={`mt-3 flex items-center gap-1 text-xs font-medium ${
                    s.up ? "text-success" : "text-destructive"
                  }`}
                >
                  {s.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {s.delta}
                  <span className="font-normal text-muted-foreground">vs mes anterior</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Flujo financiero</CardTitle>
            <CardDescription>Ingresos vs egresos por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={flujoMensual} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: 8,
                      color: "var(--foreground)",
                    }}
                  />
                  <Line type="monotone" dataKey="ingresos" stroke="var(--brand-500)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="egresos" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Ventas cerradas</CardTitle>
            <CardDescription>Evolución de estado "Vendido"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: 8,
                      color: "var(--foreground)",
                    }}
                  />
                  <Bar dataKey="ventas" fill="var(--brand-500)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listas resumen */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Próximas citas</CardTitle>
            <CardDescription>Eventos desde hoy en adelante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximasCitas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay citas próximas.</p>
            ) : null}
            {proximasCitas.map((ev) => {
              const clientData: any = Array.isArray(ev.clients) ? ev.clients[0] : ev.clients;
              const clientName = clientData?.full_name || "Sin cliente";
              
              return (
              <div key={ev.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">Cita con {clientName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(ev.appointment_date).toLocaleString('es-PE', { 
                      dateStyle: 'short', timeStyle: 'short' 
                    })}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    ev.status === "CONFIRMED" || ev.status === "COMPLETED"
                      ? "border-success/30 bg-success/10 text-success"
                      : ev.status === "CANCELLED" 
                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                      : "border-warning/30 bg-warning/10 text-warning"
                  }
                >
                  {ev.status}
                </Badge>
              </div>
            )})}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Clientes recientes</CardTitle>
            <CardDescription>Últimos contactos registrados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientesRecientes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay clientes recientes.</p>
            ) : null}
            {clientesRecientes.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{c.full_name || "Sin Nombre"}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.email || c.phone} · Interés: {c.interest_level}</p>
                </div>
                <Badge
                  variant="outline"
                  className="border-brand-200 bg-brand-50 text-brand-700"
                >
                  {c.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
