"use client"

import { CalendarDays, Clock, Plus, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { MOCK_AGENDA } from "@/lib/mock-data"
import { useState } from "react"

const tipoBadge: Record<string, string> = {
  Visita: "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200",
  Reunión: "border-warning/30 bg-warning/10 text-warning",
  Firma: "border-success/30 bg-success/10 text-success",
  Llamada: "border-border bg-muted text-muted-foreground",
}

export default function AgendaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Agenda</h2>
          <p className="text-sm text-muted-foreground">
            Visitas, reuniones y firmas programadas.
          </p>
        </div>
        <Button className="bg-brand-500 text-white hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Nuevo evento
        </Button>
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
            <CardTitle className="text-base">Próximos eventos</CardTitle>
            <CardDescription>{MOCK_AGENDA.length} programados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_AGENDA.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-4 transition hover:border-brand-200 dark:hover:border-brand-500/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{ev.titulo}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {ev.cliente}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {ev.fecha}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {ev.hora}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={tipoBadge[ev.tipo]}>{ev.tipo}</Badge>
                  <Badge
                    variant="outline"
                    className={
                      ev.estado === "Confirmado"
                        ? "border-success/30 bg-success/10 text-success"
                        : ev.estado === "Cancelado"
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-warning/30 bg-warning/10 text-warning"
                    }
                  >
                    {ev.estado}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
