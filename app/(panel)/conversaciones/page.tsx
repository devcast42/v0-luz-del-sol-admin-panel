"use client"

import { useState } from "react"
import { Mail, MessageCircle, Phone, Send, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MOCK_CONVERSACIONES } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const channelIcon = {
  WhatsApp: MessageCircle,
  Email: Mail,
  Llamada: Phone,
  Presencial: Users,
} as const

export default function ConversacionesPage() {
  const [activeId, setActiveId] = useState(MOCK_CONVERSACIONES[0]?.id)
  const active = MOCK_CONVERSACIONES.find((c) => c.id === activeId) ?? MOCK_CONVERSACIONES[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Conversaciones</h2>
        <p className="text-sm text-muted-foreground">
          Centraliza la comunicación con clientes desde todos los canales.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Bandeja</CardTitle>
            <CardDescription>{MOCK_CONVERSACIONES.length} conversaciones</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[520px]">
              <ul className="divide-y divide-border">
                {MOCK_CONVERSACIONES.map((c) => {
                  const Icon = channelIcon[c.canal]
                  const selected = c.id === activeId
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setActiveId(c.id)}
                        className={cn(
                          "flex w-full gap-3 px-4 py-3 text-left transition-colors",
                          selected ? "bg-brand-50 dark:bg-brand-500/10" : "hover:bg-muted/60",
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
                            {c.cliente.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium text-foreground">{c.cliente}</p>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {c.fecha.split(" ")[1]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Icon className="h-3 w-3" />
                            <span>{c.canal}</span>
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">{c.ultimoMensaje}</p>
                        </div>
                        {c.noLeidos > 0 && (
                          <Badge className="h-5 min-w-[20px] justify-center rounded-full bg-brand-500 px-1.5 text-[10px] text-white hover:bg-brand-500">
                            {c.noLeidos}
                          </Badge>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex min-h-[580px] flex-col border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
                  {active?.cliente.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{active?.cliente}</p>
                <p className="text-xs text-muted-foreground">Canal: {active?.canal}</p>
              </div>
            </div>
            <Badge variant="outline">{active?.fecha}</Badge>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 overflow-y-auto p-6">
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl rounded-tl-md bg-muted px-4 py-2 text-sm">
                Hola, estoy interesado en conocer más detalles sobre la propiedad.
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[75%] rounded-2xl rounded-tr-md bg-brand-500 px-4 py-2 text-sm text-white">
                Hola {active?.cliente.split(" ")[0]}, con gusto. ¿Te parece coordinar una visita esta semana?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl rounded-tl-md bg-muted px-4 py-2 text-sm">
                {active?.ultimoMensaje}
              </div>
            </div>
          </CardContent>
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input placeholder="Escribe un mensaje..." />
              <Button className="bg-brand-500 text-white hover:bg-brand-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
