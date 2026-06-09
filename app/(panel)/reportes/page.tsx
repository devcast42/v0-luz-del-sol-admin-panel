"use client"

import { Download } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MOCK_EGRESOS, MOCK_INGRESOS } from "@/lib/mock-data"

export default function ReportesPage() {
  const totalIngresos = MOCK_INGRESOS.reduce((acc, m) => acc + m.monto, 0)
  const totalEgresos = MOCK_EGRESOS.reduce((acc, m) => acc + m.monto, 0)
  const utilidad = totalIngresos - totalEgresos
  const margen = ((utilidad / totalIngresos) * 100).toFixed(1)

  const comparativo = [
    { mes: "Ene", ingresos: 32000, egresos: 18000 },
    { mes: "Feb", ingresos: 41000, egresos: 21000 },
    { mes: "Mar", ingresos: 38000, egresos: 19500 },
    { mes: "Abr", ingresos: 56000, egresos: 24000 },
    { mes: "May", ingresos: 59000, egresos: 22500 },
  ]

  const categoriasEgresos = Object.entries(
    MOCK_EGRESOS.reduce<Record<string, number>>((acc, m) => {
      acc[m.categoria] = (acc[m.categoria] ?? 0) + m.monto
      return acc
    }, {}),
  ).map(([categoria, monto]) => ({ categoria, monto }))

  const COLORS = ["var(--brand-500)", "var(--brand-300)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Reportes</h2>
          <p className="text-sm text-muted-foreground">
            Estado financiero y análisis comparativo del negocio.
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total ingresos</p>
            <p className="mt-2 text-2xl font-semibold text-success">S/ {totalIngresos.toLocaleString("es-PE")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total egresos</p>
            <p className="mt-2 text-2xl font-semibold text-destructive">S/ {totalEgresos.toLocaleString("es-PE")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Utilidad</p>
            <p className="mt-2 text-2xl font-semibold text-brand-600 dark:text-brand-300">
              S/ {utilidad.toLocaleString("es-PE")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Margen</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{margen}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Comparativo mensual</CardTitle>
            <CardDescription>Ingresos vs egresos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativo}>
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
                  <Legend />
                  <Bar dataKey="ingresos" fill="var(--brand-500)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="egresos" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Egresos por categoría</CardTitle>
            <CardDescription>Distribución del gasto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriasEgresos}
                    dataKey="monto"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {categoriasEgresos.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      borderColor: "var(--border)",
                      borderRadius: 8,
                      color: "var(--foreground)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
