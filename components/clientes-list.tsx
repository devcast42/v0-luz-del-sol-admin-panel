"use client"

import { useMemo, useState } from "react"
import { Plus, Search, Loader2 } from "lucide-react"
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
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

type DBClient = {
  id: string
  full_name: string | null
  phone: string
  email: string | null
  status: string
  interest_level: string
  created_at: string
}

export function ClientesList({ initialClientes }: { initialClientes: DBClient[] }) {
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [interestFilter, setInterestFilter] = useState("ALL")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  
  const router = useRouter()
  const supabase = createClient()

  const filtered = useMemo(() => {
    return initialClientes.filter((c) => {
      const matchQ = [c.full_name || "", c.email || "", c.phone || ""].some((v) =>
        v.toLowerCase().includes(q.toLowerCase())
      )
      const matchStatus = statusFilter === "ALL" || c.status === statusFilter
      const matchInterest = interestFilter === "ALL" || c.interest_level === interestFilter
      
      return matchQ && matchStatus && matchInterest
    })
  }, [q, statusFilter, interestFilter, initialClientes])

  const exportToCSV = () => {
    import('papaparse').then((Papa) => {
      const csvData = filtered.map(c => ({
        ID: c.id,
        Nombre: c.full_name || "Sin Nombre",
        Telefono: c.phone,
        Email: c.email || "",
        Estado: c.status,
        Interes: c.interest_level,
        Creado: new Date(c.created_at).toLocaleDateString()
      }))
      const csv = Papa.unparse(csvData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "clientes_export.csv")
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { error } = await supabase.from("clients").insert([
      {
        full_name: fullName,
        email: email,
        phone: phone,
        status: "NEW",
        interest_level: "LOW"
      }
    ])

    setIsSubmitting(false)

    if (error) {
      console.error("Error creating client:", error)
      alert("Error al crear cliente: " + error.message)
    } else {
      setIsOpen(false)
      setFullName("")
      setEmail("")
      setPhone("")
      router.refresh()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <Badge variant="outline" className="border-brand-200 bg-brand-50 text-brand-700">Nuevo</Badge>;
      case 'CONTACTED': return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Contactado</Badge>;
      case 'APPOINTMENT': return <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">Cita Agendada</Badge>;
      case 'NEGOTIATION': return <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">En Negociación</Badge>;
      case 'SOLD': return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Vendido</Badge>;
      case 'LOST': return <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">Perdido</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  }

  const getInterestBadge = (level: string) => {
    switch (level) {
      case 'HIGH': return <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">Alto</Badge>;
      case 'MEDIUM': return <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">Medio</Badge>;
      case 'LOW': return <Badge variant="outline" className="border-border bg-muted text-muted-foreground">Bajo</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Directorio de leads y clientes potenciales gestionados.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={exportToCSV} className="bg-white w-full sm:w-auto">
            Exportar CSV
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-500 text-white hover:bg-brand-600 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> Nuevo cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Ingresa los datos de contacto del nuevo lead. El estado inicial será "Nuevo".
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ej. Juan Pérez" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
                    <Input id="phone" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+51 987 654 321" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@ejemplo.com" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-brand-500 text-white">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Guardar Cliente
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 space-y-0 pb-4 border-b border-border/40">
          <div>
            <CardTitle className="text-base">Listado de Clientes</CardTitle>
            <CardDescription>{filtered.length} clientes encontrados</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="NEW">Nuevo</option>
              <option value="CONTACTED">Contactado</option>
              <option value="QUALIFIED">Calificado</option>
              <option value="APPOINTMENT_SCHEDULED">Cita Agendada</option>
              <option value="NEGOTIATION">En Negociación</option>
              <option value="CUSTOMER">Cliente</option>
              <option value="LOST">Perdido</option>
            </select>
            
            <select
              value={interestFilter}
              onChange={(e) => setInterestFilter(e.target.value)}
              className="flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="ALL">Todos los Intereses</option>
              <option value="HIGH">Alto</option>
              <option value="MEDIUM">Medio</option>
              <option value="LOW">Bajo</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-hidden">
          <Table className="min-w-[800px]">
            <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Interés</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Registrado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.full_name || "Sin Nombre"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{c.email || "—"}</span>
                          <span className="text-xs text-muted-foreground">{c.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getInterestBadge(c.interest_level)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(c.status)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
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
