"use client"

import { useMemo, useState } from "react"
import { Plus, Search, TrendingUp, Loader2 } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

type DBIngreso = {
  id: string
  fecha: string
  client_id: string | null
  monto: number
  moneda: string
  forma_pago: string | null
  numero_operacion: string | null
  clients?: { full_name: string | null } | null
}

export function IngresosList({ initialIngresos, clients }: { initialIngresos: DBIngreso[], clients: { id: string, full_name: string | null }[] }) {
  const [q, setQ] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [monto, setMonto] = useState("")
  const [moneda, setMoneda] = useState("PEN")
  const [formaPago, setFormaPago] = useState("")
  const [numeroOperacion, setNumeroOperacion] = useState("")
  const [clientId, setClientId] = useState("")
  
  const router = useRouter()
  const supabase = createClient()

  const filtered = useMemo(
    () =>
      initialIngresos.filter((m) =>
        [m.numero_operacion || "", m.forma_pago || "", m.clients?.full_name || ""].some((v) =>
          v.toLowerCase().includes(q.toLowerCase()),
        ),
      ),
    [q, initialIngresos],
  )

  const total = filtered.reduce((acc, m) => acc + Number(m.monto), 0)

  const handleCreateIngreso = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from("ingresos").insert([
      {
        monto: Number(monto),
        moneda,
        forma_pago: formaPago,
        numero_operacion: numeroOperacion,
        client_id: clientId || null,
        created_by: user?.id
      }
    ])

    setIsSubmitting(false)

    if (error) {
      console.error("Error creating ingreso:", error)
      alert("Error al registrar ingreso: " + error.message)
    } else {
      setIsOpen(false)
      setMonto("")
      setFormaPago("")
      setNumeroOperacion("")
      setClientId("")
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Ingresos</h2>
          <p className="text-sm text-muted-foreground">Ventas de lotes, cuotas y otros cobros.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-success text-success-foreground hover:bg-success/90">
              <Plus className="h-4 w-4 mr-2" /> Registrar Ingreso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
              <DialogDescription>Añade los detalles del cobro o abono recibido.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateIngreso} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monto</Label>
                  <Input required type="number" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select value={moneda} onValueChange={setMoneda}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEN">Soles (PEN)</SelectItem>
                      <SelectItem value="USD">Dólares (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cliente Asociado (Opcional)</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin cliente específico</SelectItem>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Forma de Pago</Label>
                  <Input required value={formaPago} onChange={e => setFormaPago(e.target.value)} placeholder="Transferencia, Efectivo..." />
                </div>
                <div className="space-y-2">
                  <Label>N° Operación / Referencia</Label>
                  <Input value={numeroOperacion} onChange={e => setNumeroOperacion(e.target.value)} placeholder="00123456" />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-success text-success-foreground hover:bg-success/90">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Guardar Ingreso
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Ingresos</p>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(total)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Movimientos</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{filtered.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Movimientos de Ingreso</CardTitle>
            <CardDescription>{filtered.length} resultados</CardDescription>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Forma de Pago</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-muted-foreground">{new Date(m.fecha).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{m.clients?.full_name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{m.forma_pago}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{m.numero_operacion || "—"}</TableCell>
                  <TableCell className="text-right font-semibold text-success">
                    + {m.moneda === 'USD' ? '$' : 'S/'} {Number(m.monto).toLocaleString("es-PE")}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No se encontraron ingresos.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
