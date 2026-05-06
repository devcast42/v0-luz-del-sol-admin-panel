"use client"

import { useMemo, useState } from "react"
import { Plus, Search, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MovimientoFinanciero } from "@/lib/types"

interface Props {
  titulo: string
  descripcion: string
  data: MovimientoFinanciero[]
  variant: "ingreso" | "egreso"
}

export function FinanzasTable({ titulo, descripcion, data, variant }: Props) {
  const [q, setQ] = useState("")

  const filtered = useMemo(
    () =>
      data.filter((m) =>
        [m.concepto, m.categoria, m.referencia ?? ""].some((v) =>
          v.toLowerCase().includes(q.toLowerCase()),
        ),
      ),
    [data, q],
  )

  const total = filtered
    .filter((m) => m.estado === "Pagado")
    .reduce((acc, m) => acc + m.monto, 0)
  const pendiente = filtered
    .filter((m) => m.estado === "Pendiente")
    .reduce((acc, m) => acc + m.monto, 0)

  const Icon = variant === "ingreso" ? TrendingUp : TrendingDown
  const accentColor = variant === "ingreso" ? "text-success" : "text-destructive"

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{titulo}</h2>
          <p className="text-sm text-muted-foreground">{descripcion}</p>
        </div>
        <Button className="bg-brand-500 text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Registrar {variant === "ingreso" ? "ingreso" : "egreso"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total {variant === "ingreso" ? "cobrado" : "pagado"}
              </p>
              <Icon className={`h-4 w-4 ${accentColor}`} />
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">S/ {total.toLocaleString("es-PE")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pendiente
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">S/ {pendiente.toLocaleString("es-PE")}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Movimientos
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{filtered.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Movimientos</CardTitle>
            <CardDescription>{filtered.length} resultados</CardDescription>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead className="text-right">Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.concepto}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{m.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.metodo}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        m.estado === "Pagado"
                          ? "border-success/30 bg-success/10 text-success"
                          : m.estado === "Pendiente"
                            ? "border-warning/30 bg-warning/10 text-warning"
                            : "border-destructive/30 bg-destructive/10 text-destructive"
                      }
                    >
                      {m.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{m.referencia}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{m.fecha}</TableCell>
                  <TableCell className={`text-right font-semibold ${accentColor}`}>
                    {variant === "ingreso" ? "+" : "-"} S/ {m.monto.toLocaleString("es-PE")}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No se encontraron movimientos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
