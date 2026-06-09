"use client"

import { useRef } from "react"
import { Download } from "lucide-react"
import { useReactToPrint } from "react-to-print"
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

interface ReportesProps {
  ingresos: any[]
  egresos: any[]
}

export function ReportesView({ ingresos, egresos }: ReportesProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Reporte_Financiero_LuzDelSol",
  })

  const totalIngresos = ingresos.reduce((acc, m) => acc + Number(m.monto), 0)
  const totalEgresos = egresos.reduce((acc, m) => acc + Number(m.monto), 0)
  const utilidad = totalIngresos - totalEgresos
  const margen = totalIngresos > 0 ? ((utilidad / totalIngresos) * 100).toFixed(1) : "0.0"

  // Agrupar egresos por categoría
  const categoriasEgresosMap = egresos.reduce((acc: Record<string, number>, m) => {
    const cat = m.categorias_egreso?.nombre || "Sin Categoría"
    acc[cat] = (acc[cat] || 0) + Number(m.monto)
    return acc
  }, {})

  const categoriasEgresos = Object.entries(categoriasEgresosMap).map(([categoria, monto]) => ({ categoria, monto }))

  const agruparPorMes = (datos: any[]) => {
    return datos.reduce((acc: Record<string, number>, m) => {
      const mes = new Date(m.fecha).toLocaleString('es-PE', { month: 'short' })
      acc[mes] = (acc[mes] || 0) + Number(m.monto)
      return acc
    }, {})
  }

  const ingresosMes = agruparPorMes(ingresos)
  const egresosMes = agruparPorMes(egresos)

  const mesesSet = new Set([...Object.keys(ingresosMes), ...Object.keys(egresosMes)])
  const comparativo = Array.from(mesesSet).map(mes => ({
    mes,
    ingresos: ingresosMes[mes] || 0,
    egresos: egresosMes[mes] || 0
  }))

  const COLORS = ["#0ea5e9", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#64748b"]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Reportes</h2>
          <p className="text-sm text-muted-foreground">
            Estado financiero y análisis comparativo del negocio.
          </p>
        </div>
        <Button variant="outline" onClick={() => handlePrint()}>
          <Download className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      {/* Contenedor que será impreso */}
      <div ref={contentRef} className="space-y-6 bg-background print:p-8 rounded-lg print:block">
        
        {/* Cabecera exclusiva para impresión */}
        <div className="hidden print:flex items-center justify-between border-b pb-6 mb-6">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Luz del Sol" className="h-16 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Luz del Sol</h1>
              <p className="text-sm text-muted-foreground">Compañía Inmobiliaria</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">Reporte Financiero</h2>
            <p className="text-sm text-muted-foreground">
              Generado: {new Date().toLocaleDateString('es-PE')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
          <Card className="border-border/60 print:shadow-none print:border-gray-200">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total ingresos</p>
              <p className="mt-2 text-2xl font-semibold text-success">S/ {totalIngresos.toLocaleString("es-PE")}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 print:shadow-none print:border-gray-200">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total egresos</p>
              <p className="mt-2 text-2xl font-semibold text-destructive">S/ {totalEgresos.toLocaleString("es-PE")}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 print:shadow-none print:border-gray-200">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Utilidad</p>
              <p className="mt-2 text-2xl font-semibold text-brand-600 dark:text-brand-300">
                S/ {utilidad.toLocaleString("es-PE")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 print:shadow-none print:border-gray-200">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Margen</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{margen}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 print:grid-cols-3 print:gap-6 print:break-inside-avoid">
          <Card className="lg:col-span-2 print:col-span-2 border-border/60 print:shadow-none print:border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">Comparativo mensual</CardTitle>
              <CardDescription>Ingresos vs egresos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparativo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        borderColor: "var(--border)",
                        borderRadius: 8,
                        color: "var(--foreground)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="ingresos" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Ingresos" />
                    <Bar dataKey="egresos" fill="#ef4444" radius={[6, 6, 0, 0]} name="Egresos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 print:shadow-none print:border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">Egresos por categoría</CardTitle>
              <CardDescription>Distribución del gasto</CardDescription>
            </CardHeader>
            <CardContent>
              {categoriasEgresos.length > 0 ? (
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
                        label={false} // Disable labels to save space in print
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
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground text-sm">
                  Sin datos de egresos
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Footer para impresión */}
        <div className="hidden print:block mt-12 text-center text-sm text-muted-foreground border-t pt-4">
          Reporte generado automáticamente por la plataforma administrativa de Luz del Sol.
        </div>
      </div>
    </div>
  )
}
