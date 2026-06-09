"use client"

import { useMemo, useState } from "react"
import { Plus, Search, TrendingDown, Loader2 } from "lucide-react"
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
import Tesseract from "tesseract.js"

type DBEgreso = {
  id: string
  fecha: string
  categoria_id: string | null
  descripcion: string | null
  monto: number
  moneda: string
  proveedor: string | null
  forma_pago: string | null
  estado: string
  categorias_egreso?: { nombre: string } | null
}

export function EgresosList({ initialEgresos, categorias, userRole }: { initialEgresos: DBEgreso[], categorias: { id: string, nombre: string }[], userRole: string }) {
  const [q, setQ] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [monto, setMonto] = useState("")
  const [moneda, setMoneda] = useState("PEN")
  const [descripcion, setDescripcion] = useState("")
  const [proveedor, setProveedor] = useState("")
  const [formaPago, setFormaPago] = useState("")
  const [categoriaId, setCategoriaId] = useState("")
  const [estado, setEstado] = useState("PENDING")
  
  // OCR state
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  const router = useRouter()
  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert("⚠️ Error: El archivo subido no es una imagen válida. Por favor sube un JPG o PNG.")
      e.target.value = '' // Reset input
      return
    }

    setIsScanning(true)
    setScanProgress(0)

    try {
      const result = await Tesseract.recognize(file, 'spa', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.floor(m.progress * 100))
          }
        }
      })
      
      const text = result.data.text
      console.log("OCR Result:", text)
      
      if (text.trim().length < 5) {
        alert("No se detectó suficiente texto legible. Intenta con una foto más clara o bien iluminada.")
        return
      }

      // Basic extraction logic
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      
      // Intentar extraer usando etiquetas explícitas si existen en el texto
      const fullTextUpper = text.toUpperCase()
      
      // 1. Extraer Monto
      let foundMonto = ""
      const amountRegex = /(?:TOTAL|IMPORTE|S\/|USD|\$|PAGAR|MONTO)\s*[:=]?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/i
      const match = text.match(amountRegex)
      
      if (match && match[1]) {
        foundMonto = match[1].replace(',', '.')
      } else {
        const fallbackRegex = /\b(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))\b/g
        const matches = [...text.matchAll(fallbackRegex)]
        if (matches.length > 0) {
           let max = 0
           matches.forEach(m => {
             const val = parseFloat(m[1].replace(',', '.'))
             if (val > max) { max = val; foundMonto = m[1].replace(',', '.') }
           })
        }
      }

      if (foundMonto) {
        setMonto(foundMonto)
      } else {
        alert("Se leyó el texto, pero no se encontró un monto claro. Ingrésalo manualmente.")
      }

      // 2. Extraer Proveedor
      let foundProveedor = ""
      const provIndex = lines.findIndex(l => l.toUpperCase().includes('PROVEEDOR'))
      if (provIndex !== -1 && provIndex + 1 < lines.length) {
        // Asume que el nombre del proveedor está en la línea siguiente a la etiqueta
        let provLines = []
        for (let i = provIndex + 1; i < lines.length; i++) {
          if (lines[i].toUpperCase().includes('ESTADO:') || lines[i].toUpperCase().includes('FORMA DE PAGO') || lines[i].toUpperCase().includes('RUC')) break
          provLines.push(lines[i])
        }
        foundProveedor = provLines.join(' ').trim()
      }
      
      if (foundProveedor) {
        setProveedor(foundProveedor.substring(0, 50))
      } else {
        // Fallback genérico: la primera línea larga que no sea "detalle de gasto", "recibo", etc.
        const possibleProvider = lines.find(l => 
          l.length > 4 && 
          !l.toUpperCase().includes('RUC') && 
          !l.toUpperCase().includes('FACTURA') && 
          !l.toUpperCase().includes('BOLETA') &&
          !l.toUpperCase().includes('DETALLE DE GASTO') &&
          !l.toUpperCase().includes('RECIBO')
        )
        if (possibleProvider) setProveedor(possibleProvider.substring(0, 50))
      }

      // 3. Extraer Descripción
      const descIndex = lines.findIndex(l => l.toUpperCase().includes('DESCRIPCIÓN') || l.toUpperCase().includes('DESCRIPCION'))
      if (descIndex !== -1 && descIndex + 1 < lines.length) {
        setDescripcion(lines[descIndex + 1].replace(/Ej\.?\s*/i, '').trim().substring(0, 100))
      }

      // 4. Extraer Forma de Pago
      const pagoIndex = lines.findIndex(l => l.toUpperCase().includes('FORMA DE PAGO'))
      if (pagoIndex !== -1 && pagoIndex + 1 < lines.length) {
        setFormaPago(lines[pagoIndex + 1].trim().substring(0, 50))
      }
      
      
    } catch (err: any) {
      // Usamos solo alert porque console.error activa la pantalla roja de Next.js en modo desarrollo
      alert("Error interno al escanear el recibo: " + (err.message || "Archivo corrupto"))
    } finally {
      setIsScanning(false)
      setScanProgress(0)
    }
  }

  const filtered = useMemo(
    () =>
      initialEgresos.filter((m) =>
        [m.descripcion || "", m.proveedor || "", m.categorias_egreso?.nombre || ""].some((v) =>
          v.toLowerCase().includes(q.toLowerCase()),
        ),
      ),
    [q, initialEgresos],
  )

  const total = filtered.reduce((acc, m) => acc + Number(m.monto), 0)

  const handleCreateEgreso = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from("egresos").insert([
      {
        monto: Number(monto),
        moneda,
        descripcion,
        proveedor,
        forma_pago: formaPago,
        categoria_id: categoriaId || null,
        estado,
        created_by: user?.id
      }
    ])

    setIsSubmitting(false)

    if (error) {
      console.error("Error creating egreso:", error)
      alert("Error al registrar egreso: " + error.message)
    } else {
      setIsOpen(false)
      setMonto("")
      setDescripcion("")
      setProveedor("")
      setFormaPago("")
      setCategoriaId("")
      setEstado("PENDING")
      router.refresh()
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("egresos").update({ estado: newStatus }).eq("id", id)
    if (error) {
      alert("Error al actualizar: " + error.message)
    } else {
      router.refresh()
    }
  }

  const canApprove = userRole === "ADMIN" || userRole === "CONTADOR" || userRole === "SUPER_ADMIN"

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Egresos</h2>
          <p className="text-sm text-muted-foreground">Control de gastos, publicidad y operativos.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Plus className="h-4 w-4 mr-2" /> Registrar Egreso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Egreso</DialogTitle>
              <DialogDescription>Añade los detalles del pago o gasto realizado.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEgreso} className="space-y-4">
              
              {/* OCR Scanner */}
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-2">
                <Label className="text-brand-600 dark:text-brand-400 font-medium flex items-center gap-2">
                  <span>Escanear Comprobante (Opcional)</span>
                  {isScanning && <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-[10px]">Analizando {scanProgress}%</Badge>}
                </Label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isScanning} className="text-xs" />
                <p className="text-[11px] text-muted-foreground">Sube una foto del recibo para autocompletar monto y proveedor.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label>Descripción / Concepto</Label>
                <Input required value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej. Pago de publicidad en Meta" />
              </div>

              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar categoría..." /></SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Input value={proveedor} onChange={e => setProveedor(e.target.value)} placeholder="Nombre del proveedor" />
                </div>
                <div className="space-y-2">
                  <Label>Forma de Pago</Label>
                  <Input value={formaPago} onChange={e => setFormaPago(e.target.value)} placeholder="Transferencia, Tarjeta..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="APPROVED">Aprobado / Pagado</SelectItem>
                    <SelectItem value="REJECTED">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Guardar Egreso
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
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Egresos</p>
              <TrendingDown className="h-4 w-4 text-destructive" />
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

      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Movimientos de Egreso</CardTitle>
            <CardDescription>{filtered.length} resultados</CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 w-full" />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-hidden">
          <Table className="min-w-[800px]">
            <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    {canApprove && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-muted-foreground">{new Date(m.fecha).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{m.descripcion || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{m.categorias_egreso?.nombre || "Sin Categoría"}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.proveedor || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            m.estado === "APPROVED"
                              ? "border-success/30 bg-success/10 text-success"
                              : m.estado === "PENDING"
                                ? "border-warning/30 bg-warning/10 text-warning"
                                : "border-destructive/30 bg-destructive/10 text-destructive"
                          }
                        >
                          {m.estado === 'APPROVED' ? 'Pagado' : m.estado === 'PENDING' ? 'Pendiente' : 'Rechazado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-destructive">
                        - {m.moneda === 'USD' ? '$' : 'S/'} {Number(m.monto).toLocaleString("es-PE")}
                      </TableCell>
                      {canApprove && (
                        <TableCell className="text-right">
                          {m.estado === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-7 text-xs border-success text-success hover:bg-success/10" onClick={() => handleUpdateStatus(m.id, 'APPROVED')}>Aprobar</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleUpdateStatus(m.id, 'REJECTED')}>Rechazar</Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No se encontraron egresos.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
        </CardContent>
      </Card>
    </div>
  )
}
