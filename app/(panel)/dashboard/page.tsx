import { createClient } from "@/utils/supabase/server"
import { DashboardView } from "@/components/dashboard-view"

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Fetch KPI stats
  const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true })
  const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
  
  // Próximas citas de agenda a partir de hoy
  const { count: agendaCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', new Date().toISOString())
  
  // Total ingresos del mes actual
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { data: ingresosMes } = await supabase
    .from('ingresos')
    .select('monto, moneda')
    .gte('fecha', firstDay)
  
  const EXCHANGE_RATE = 3.80; // Tipo de cambio fijo para unificar en Soles (PEN)
  
  const totalIngresosPEN = ingresosMes?.reduce((sum, item) => {
    const amount = Number(item.monto)
    return item.moneda === 'USD' ? sum + (amount * EXCHANGE_RATE) : sum + amount
  }, 0) || 0

  // 2. Fetch próximos eventos (4)
  const { data: proximasCitas } = await supabase
    .from('appointments')
    .select('id, appointment_date, status, clients(full_name)')
    .gte('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true })
    .limit(4)

  // 3. Fetch clientes recientes (4)
  const { data: clientesRecientes } = await supabase
    .from('clients')
    .select('id, full_name, email, phone, status, interest_level')
    .order('created_at', { ascending: false })
    .limit(4)

  // 4. Mocks temporales para las gráficas 
  // (Para hacer estos reales tendríamos que extraer toda la tabla y agrupar por mes, o usar rpc en PostgreSQL)
  const flujoMensual = [
    { mes: "Ene", ingresos: 32000, egresos: 18000 },
    { mes: "Feb", ingresos: 41000, egresos: 21000 },
    { mes: "Mar", ingresos: 38000, egresos: 19500 },
    { mes: "Abr", ingresos: 56000, egresos: 24000 },
    { mes: "May", ingresos: totalIngresosPEN > 0 ? totalIngresosPEN : 59000, egresos: 22500 },
  ]

  const ventasMes = [
    { mes: "Ene", ventas: 4 },
    { mes: "Feb", ventas: 6 },
    { mes: "Mar", ventas: 5 },
    { mes: "Abr", ventas: 8 },
    { mes: "May", ventas: 11 },
  ]

  return (
    <DashboardView 
      stats={{
        clients: clientsCount || 0,
        projects: projectsCount || 0,
        appointments: agendaCount || 0,
        revenue: totalIngresosPEN
      }}
      flujoMensual={flujoMensual}
      ventasMes={ventasMes}
      proximasCitas={proximasCitas || []}
      clientesRecientes={clientesRecientes || []}
    />
  )
}
