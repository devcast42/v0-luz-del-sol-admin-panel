"use client"

import { useState } from "react"
import { Calculator, CheckCircle2, DollarSign, Wallet, History, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export function ArqueoView({ 
  historial, 
  hoy, 
  totalIngresos, 
  totalEgresos, 
  cajaHoy,
  userId
}: { 
  historial: any[]
  hoy: string
  totalIngresos: number
  totalEgresos: number
  cajaHoy: any
  userId: string
}) {
  const [apertura, setApertura] = useState(cajaHoy?.monto_apertura?.toString() || "")
  const [cierreFisico, setCierreFisico] = useState(cajaHoy?.monto_cierre_fisico?.toString() || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async (isCierre: boolean) => {
    setIsSubmitting(true)

    const numApertura = Number(apertura) || 0
    const numCierreFisico = isCierre ? Number(cierreFisico) || 0 : null
    
    // Calculo esperado: Apertura + Ingresos - Egresos
    const esperado = numApertura + totalIngresos - totalEgresos
    const diferencia = isCierre ? numCierreFisico! - esperado : null

    const payload = {
      fecha: hoy,
      monto_apertura: numApertura,
      monto_cierre_fisico: numCierreFisico,
      ingresos_registrados: totalIngresos,
      egresos_registrados: totalEgresos,
      diferencia: diferencia,
      created_by: userId
    }

    let error
    if (cajaHoy) {
      const res = await supabase.from('caja_diaria').update(payload).eq('id', cajaHoy.id)
      error = res.error
    } else {
      const res = await supabase.from('caja_diaria').insert([payload])
      error = res.error
    }

    setIsSubmitting(false)
    if (error) {
      alert("Error: " + error.message)
    } else {
      router.refresh()
    }
  }

  const saldoEsperado = (Number(apertura) || 0) + totalIngresos - totalEgresos
  const difCalculada = (Number(cierreFisico) || 0) - saldoEsperado
  const yaCerrado = cajaHoy?.monto_cierre_fisico !== null && cajaHoy?.monto_cierre_fisico !== undefined

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Cuadre de Caja (Arqueo)</h2>
        <p className="text-sm text-muted-foreground">Registra el efectivo inicial y final para verificar diferencias.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-brand-500" />
              Arqueo del Día ({new Date(hoy).toLocaleDateString()})
            </CardTitle>
            <CardDescription>
              {yaCerrado ? "Caja cerrada por hoy. Puedes modificarla si es necesario." : "Abre la caja y al final del día registra el cierre físico."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label>Efectivo Físico Inicial (Apertura) en PEN</Label>
              <Input 
                type="number" 
                value={apertura} 
                onChange={e => setApertura(e.target.value)} 
                placeholder="Ej. 100"
                disabled={yaCerrado}
              />
              {!cajaHoy && (
                <Button onClick={() => handleSave(false)} disabled={isSubmitting || !apertura} variant="outline" size="sm" className="mt-2">
                  Registrar Apertura
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 border border-border/50">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos del sistema</p>
                <p className="text-xl font-bold text-success">+ S/ {totalIngresos.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Egresos aprobados</p>
                <p className="text-xl font-bold text-destructive">- S/ {totalEgresos.toFixed(2)}</p>
              </div>
            </div>

            <div className="rounded-lg bg-brand-50 dark:bg-brand-500/10 p-4 border border-brand-200 dark:border-brand-500/30">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Saldo Esperado en Caja</p>
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">S/ {saldoEsperado.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <Label>Efectivo Físico al Cierre en PEN</Label>
              <Input 
                type="number" 
                value={cierreFisico} 
                onChange={e => setCierreFisico(e.target.value)} 
                placeholder="Ej. 1500"
                className={cierreFisico && difCalculada !== 0 ? "border-warning ring-warning" : ""}
              />
              
              {cierreFisico && (
                <div className={`flex items-center gap-2 text-sm p-2 rounded mt-2 ${difCalculada === 0 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {difCalculada === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {difCalculada === 0 
                    ? "¡La caja cuadra perfectamente!" 
                    : difCalculada > 0 
                      ? `Hay un SOBRANTE de S/ ${Math.abs(difCalculada).toFixed(2)}` 
                      : `FALTAN S/ ${Math.abs(difCalculada).toFixed(2)} en caja`}
                </div>
              )}
            </div>

            <Button onClick={() => handleSave(true)} disabled={isSubmitting || !cierreFisico} className="w-full bg-brand-500 text-white hover:bg-brand-600">
              {yaCerrado ? "Actualizar Cierre" : "Cerrar Caja"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-muted-foreground" />
              Historial Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historial.map((h) => (
                <div key={h.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{new Date(h.fecha).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">Usuario: {h.usuarios?.nombre || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    {h.diferencia === null ? (
                      <Badge variant="outline">Caja Abierta</Badge>
                    ) : h.diferencia === 0 ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">Cuadrado</Badge>
                    ) : (
                      <Badge variant="outline" className={h.diferencia > 0 ? "bg-info/10 text-info border-info/30" : "bg-warning/10 text-warning border-warning/30"}>
                        {h.diferencia > 0 ? `Sobra ${h.diferencia}` : `Falta ${Math.abs(h.diferencia)}`}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {historial.length === 0 && <p className="text-sm text-muted-foreground">No hay registros históricos.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
