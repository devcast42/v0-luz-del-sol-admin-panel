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
import { MOCK_AGENDA, MOCK_CLIENTES } from "@/lib/mock-data"

const ventasMes = [
  { mes: "Ene", ventas: 4 },
  { mes: "Feb", ventas: 6 },
  { mes: "Mar", ventas: 5 },
  { mes: "Abr", ventas: 8 },
  { mes: "May", ventas: 11 },
]

const flujoMensual = [
  { mes: "Ene", ingresos: 32000, egresos: 18000 },
  { mes: "Feb", ingresos: 41000, egresos: 21000 },
  { mes: "Mar", ingresos: 38000, egresos: 19500 },
  { mes: "Abr", ingresos: 56000, egresos: 24000 },
  { mes: "May", ingresos: 59000, egresos: 22500 },
]

export default function DashboardPage() {
  const stats = [
    { label: "Clientes activos", value: "128", delta: "+12%", up: true,  icon: UsersRound },
    { label: "Propiedades",      value: "47",  delta: "+4",   up: true,  icon: Home },
    { label: "Citas esta semana", value: "9",  delta: "-2",   up: false, icon: CalendarDays },
    { label: "Ingresos del mes", value: "S/ 59,000", delta: "+5.4%", up: true, icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
          Resumen general
        </h2>
        <p className="text-sm text-muted-foreground">
          Vista rápida del rendimiento de Luz del Sol este mes.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
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
            <CardDescription>Últimos 5 meses</CardDescription>
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
            <CardDescription>Eventos confirmados y pendientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_AGENDA.slice(0, 4).map((ev) => (
              <div key={ev.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{ev.titulo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ev.cliente} · {ev.fecha} {ev.hora}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    ev.estado === "Confirmado"
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-warning/30 bg-warning/10 text-warning"
                  }
                >
                  {ev.estado}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Clientes recientes</CardTitle>
            <CardDescription>Últimos contactos registrados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_CLIENTES.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{c.nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.email} · {c.tipo}</p>
                </div>
                <Badge
                  variant="outline"
                  className="border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200"
                >
                  {c.estado}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
