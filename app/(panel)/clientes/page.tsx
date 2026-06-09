"use client"

import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { MOCK_CLIENTES } from "@/lib/mock-data"

export default function ClientesPage() {
  const [q, setQ] = useState("")
  const filtered = useMemo(
    () =>
      MOCK_CLIENTES.filter((c) =>
        [c.nombre, c.email, c.telefono, c.asesor].some((v) =>
          v.toLowerCase().includes(q.toLowerCase()),
        ),
      ),
    [q],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Compradores, vendedores, inversores e inquilinos.
          </p>
        </div>
        <Button className="bg-brand-500 text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Nuevo cliente
        </Button>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Listado de clientes</CardTitle>
            <CardDescription>{filtered.length} resultados</CardDescription>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
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
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Asesor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Registrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{c.email}</span>
                      <span className="text-xs text-muted-foreground">{c.telefono}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.asesor}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        c.estado === "Activo"
                          ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200"
                          : c.estado === "Prospecto"
                            ? "border-warning/30 bg-warning/10 text-warning"
                            : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {c.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{c.createdAt}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No se encontraron clientes.
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
