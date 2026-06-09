import { createClient } from "@/utils/supabase/server"
import { ArqueoView } from "@/components/arqueo-view"

export default async function ArqueoPage() {
  const supabase = await createClient()

  // Solo ADMIN y CONTADOR
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  if (profile?.rol !== 'ADMIN' && profile?.rol !== 'CONTADOR' && profile?.rol !== 'SUPER_ADMIN') {
    return <div className="p-10 text-center">Acceso denegado. Se requiere rol de Administrador o Contador.</div>
  }

  // Traemos los registros históricos de arqueo
  const { data: historial } = await supabase
    .from('caja_diaria')
    .select('*, usuarios(nombre)')
    .order('fecha', { ascending: false })
    .limit(30)

  // Calculamos los ingresos y egresos de HOY
  const today = new Date().toISOString().split('T')[0]
  
  const { data: ingresosHoy } = await supabase
    .from('ingresos')
    .select('monto, moneda')
    .gte('fecha', `${today}T00:00:00Z`)
    
  const { data: egresosHoy } = await supabase
    .from('egresos')
    .select('monto, moneda')
    .gte('fecha', `${today}T00:00:00Z`)
    .eq('estado', 'APPROVED')

  const sumPen = (items: any[]) => items?.reduce((acc, curr) => curr.moneda === 'PEN' ? acc + Number(curr.monto) : acc + (Number(curr.monto) * 3.8), 0) || 0

  const totalIngresos = sumPen(ingresosHoy || [])
  const totalEgresos = sumPen(egresosHoy || [])

  // Revisar si ya hay un registro de HOY
  const { data: cajaHoy } = await supabase
    .from('caja_diaria')
    .select('*')
    .eq('fecha', today)
    .single()

  return <ArqueoView 
    historial={historial || []} 
    hoy={today}
    totalIngresos={totalIngresos}
    totalEgresos={totalEgresos}
    cajaHoy={cajaHoy}
    userId={user.id}
  />
}
