"use client"

import { useState } from "react"
import { CalendarDays, Clock, Plus, MapPin, MessageSquare, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

type DBAppointment = {
  id: string
  client_id: string | null
  user_id: string | null
  property_id: string | null
  appointment_date: string
  status: string
  notes: string | null
  clients?: { full_name: string | null; phone: string | null } | null
  properties?: { code: string | null; title: string | null; projects?: { name: string | null } | null } | null
}

export function AgendaList({ 
  initialAgenda, 
  clients, 
  properties, 
  userRole,
  userId
}: { 
  initialAgenda: DBAppointment[], 
  clients: { id: string, full_name: string | null }[],
  properties: { id: string, title: string | null, code: string | null }[],
  userRole: string,
  userId: string
}) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Conversaciones modal
  const [chatOpen, setChatOpen] = useState(false)
  const [currentClientName, setCurrentClientName] = useState("")
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  
  // Form state
  const [clientId, setClientId] = useState("")
  const [propertyId, setPropertyId] = useState("")
  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [status, setStatus] = useState("PENDING")
  const [notes, setNotes] = useState("")
  
  const router = useRouter()
  const supabase = createClient()

  // Filter by selected date
  const selectedDateStr = date ? date.toISOString().split('T')[0] : null
  
  const filteredEvents = initialAgenda.filter(ev => {
    if (!selectedDateStr) return true;
    const evDate = new Date(ev.appointment_date);
    const evDateStr = evDate.toISOString().split('T')[0];
    return evDateStr === selectedDateStr;
  })

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create timestamp from fecha and hora
    const appointmentDate = new Date(`${fecha}T${hora}:00`).toISOString()

    const { error } = await supabase.from("appointments").insert([
      {
        client_id: clientId || null,
        property_id: propertyId && propertyId !== "none" ? propertyId : null,
        user_id: userId,
        appointment_date: appointmentDate,
        status,
        notes
      }
    ])

    setIsSubmitting(false)

    if (error) {
      console.error("Error creating appointment:", error)
      alert("Error al agendar cita: " + error.message)
    } else {
      setIsOpen(false)
      setClientId("")
      setPropertyId("")
      setFecha("")
      setHora("")
      setNotes("")
      setStatus("PENDING")
      router.refresh()
    }
  }

  const openConversation = async (clientId: string, clientName: string) => {
    setChatOpen(true)
    setCurrentClientName(clientName)
    setIsLoadingChat(true)
    
    // Fetch interactions for this client
    const { data, error } = await supabase
      .from("interactions")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true })
    
    setIsLoadingChat(false)
    if (data) {
      setChatMessages(data)
    } else if (error) {
      console.error("Error fetching interactions:", error)
      setChatMessages([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Citas y Agenda</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus visitas a terrenos y reuniones.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-500 text-white hover:bg-brand-600">
              <Plus className="h-4 w-4 mr-2" /> Nueva Cita
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Nueva Cita</DialogTitle>
              <DialogDescription>Programa una visita al terreno o reunión con un cliente.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={clientId} onValueChange={setClientId} required>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Propiedad / Terreno de interés</Label>
                <Select value={propertyId} onValueChange={setPropertyId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar propiedad (opcional)..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno / Reunión general</SelectItem>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>[{p.code}] {p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input required type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input required type="time" value={hora} onChange={e => setHora(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                    <SelectItem value="COMPLETED">Completada</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej. El cliente solicita que pasemos a recogerlo" />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-brand-500 text-white">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Agendar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Calendario</CardTitle>
            <CardDescription>Selecciona un día</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Citas del día</CardTitle>
            <CardDescription>{filteredEvents.length} programadas para {date?.toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredEvents.map((ev) => {
              const evDate = new Date(ev.appointment_date);
              const hora = evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              // PostgREST sometimes returns arrays for relations
              const clientData: any = Array.isArray(ev.clients) ? ev.clients[0] : ev.clients;
              const propertyData: any = Array.isArray(ev.properties) ? ev.properties[0] : ev.properties;
              const projData: any = propertyData ? (Array.isArray(propertyData.projects) ? propertyData.projects[0] : propertyData.projects) : null;
              
              const clientName = clientData?.full_name || "Sin cliente";
              const propStr = propertyData ? `${propertyData.title || propertyData.code || 'Propiedad'} ${projData?.name ? `(${projData.name})` : ''}` : "General";

              return (
                <div key={ev.id} className="flex flex-col gap-3 rounded-lg border border-border/60 p-4 transition hover:border-brand-200 dark:hover:border-brand-500/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{clientName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {hora}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {propStr}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                          ev.status === "COMPLETED"
                            ? "border-success/30 bg-success/10 text-success"
                            : ev.status === "CANCELLED"
                              ? "border-destructive/30 bg-destructive/10 text-destructive"
                              : "border-warning/30 bg-warning/10 text-warning"
                        }>
                        {ev.status === "COMPLETED" ? "Completada" : ev.status === "CANCELLED" ? "Cancelada" : ev.status === "CONFIRMED" ? "Confirmada" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                  
                  {ev.notes && (
                    <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground border border-border/30">
                      <strong>Notas:</strong> {ev.notes}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => openConversation(ev.client_id || '', clientName)}
                    >
                      <MessageSquare className="mr-2 h-3 w-3" /> Ver Conversación
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {filteredEvents.length === 0 && (
              <div className="py-10 text-center text-muted-foreground border border-dashed rounded-lg">
                No hay citas programadas para este día.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Conversaciones */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg h-[80vh] flex flex-col">
          <DialogHeader className="pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-500" />
              Conversación con {currentClientName}
            </DialogTitle>
            <DialogDescription>
              Historial de interacciones (WhatsApp, llamadas, bot).
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoadingChat ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                <p>No hay mensajes registrados con este cliente.</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={msg.id || i} className="space-y-2 border-b pb-3 mb-3 last:border-0">
                  {/* Mensaje del cliente */}
                  {msg.customer_message && (
                    <div className="flex flex-col items-start">
                      <div className="max-w-[80%] rounded-lg p-3 text-sm bg-muted border border-border/50 text-foreground">
                        <p className="font-semibold text-xs text-muted-foreground mb-1">{msg.channel}</p>
                        <p className="whitespace-pre-wrap">{msg.customer_message}</p>
                      </div>
                    </div>
                  )}
                  {/* Respuesta del agente/bot */}
                  {msg.agent_response && (
                    <div className="flex flex-col items-end mt-2">
                      <div className="max-w-[80%] rounded-lg p-3 text-sm bg-brand-500 text-white">
                        <p className="font-semibold text-xs text-brand-200 mb-1">Agente / Bot</p>
                        <p className="whitespace-pre-wrap">{msg.agent_response}</p>
                      </div>
                    </div>
                  )}
                  {/* Resumen */}
                  {msg.summary && (
                    <div className="text-xs text-center text-muted-foreground italic bg-muted/30 p-2 rounded mt-2">
                      Resumen: {msg.summary}
                    </div>
                  )}
                  <div className="text-center text-[10px] text-muted-foreground mt-1">
                    {new Date(msg.created_at).toLocaleString('es-PE')}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
