import { SupabaseClient } from '@supabase/supabase-js'

export async function createClientLead(supabase: SupabaseClient, clientData: { full_name: string, email: string, phone: string }) {
  if (!clientData.phone) throw new Error("Phone is required")
  if (clientData.full_name && clientData.full_name.length > 255) throw new Error("Name too long")
  if (clientData.email && !clientData.email.includes('@')) throw new Error("Invalid email format")
  if (clientData.full_name && /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(clientData.full_name)) throw new Error("XSS detected")
  
  const { data, error } = await supabase.from('clients').insert([{
    full_name: clientData.full_name,
    email: clientData.email,
    phone: clientData.phone,
    status: 'NEW',
    interest_level: 'LOW'
  }]).select().single()

  if (error) throw error
  return data
}

export async function createEgreso(supabase: SupabaseClient, egresoData: { monto: number, moneda: string, descripcion: string, estado?: string }) {
  if (typeof egresoData.monto !== 'number' || isNaN(egresoData.monto)) throw new Error("Monto invalido")
  if (egresoData.monto <= 0) throw new Error("Monto debe ser mayor a 0")
  if (egresoData.monto > 1000000000) throw new Error("Monto excede limite permitido")
  if (!egresoData.descripcion || egresoData.descripcion.trim() === '') throw new Error("Descripción requerida")
  if (!['PEN', 'USD'].includes(egresoData.moneda)) throw new Error("Moneda no soportada")

  const { data, error } = await supabase.from('egresos').insert([{
    ...egresoData,
    estado: egresoData.estado || 'PENDING'
  }]).select().single()

  if (error) throw error
  return data
}

export async function createTask(supabase: SupabaseClient, taskData: { title: string, assigned_to: string }) {
  if (!taskData.title || taskData.title.trim() === '') throw new Error("Title is required")
  if (taskData.title.length > 500) throw new Error("Title length exceeds maximum allowed")

  const { data, error } = await supabase.from('tasks').insert([{
    ...taskData,
    status: 'TODO'
  }]).select().single()

  if (error) throw error
  return data
}

export async function closeCashRegister(supabase: SupabaseClient, closeData: { fecha: string, monto_apertura: number, monto_cierre_fisico: number, total_ingresos: number, total_egresos: number }) {
  if (closeData.monto_apertura < 0 || closeData.monto_cierre_fisico < 0) throw new Error("Caja no puede tener fisico negativo")
  
  // Solucionar problemas de coma flotante de JS (ej. 0.1 + 0.2 = 0.3000000004)
  const esperado = Number((closeData.monto_apertura + closeData.total_ingresos - closeData.total_egresos).toFixed(2))
  const diferencia = Number((closeData.monto_cierre_fisico - esperado).toFixed(2))

  if (esperado < 0 && closeData.monto_cierre_fisico >= 0) {
    // Si matemáticamente se esperaba negativo por deudas, pero hay físico positivo, se maneja como alerta extrema
    if (diferencia > 100000) throw new Error("Diferencia masiva detectada, posible fraude")
  }

  const { data, error } = await supabase.from('caja_diaria').insert([{
    fecha: closeData.fecha,
    monto_apertura: closeData.monto_apertura,
    monto_cierre_fisico: closeData.monto_cierre_fisico,
    ingresos_registrados: closeData.total_ingresos,
    egresos_registrados: closeData.total_egresos,
    diferencia
  }]).select().single()

  if (error) throw error
  return data
}

export async function createAppointment(supabase: SupabaseClient, apptData: { client_id: string, appointment_date: string, status?: string }) {
  if (!apptData.client_id) throw new Error("Client ID required")
  
  const d = new Date(apptData.appointment_date)
  if (isNaN(d.getTime())) throw new Error("Invalid date format")
  if (d.getFullYear() > 2100 || d.getFullYear() < 2000) throw new Error("Date out of logical range")

  const { data, error } = await supabase.from('appointments').insert([{
    ...apptData,
    status: apptData.status || 'PENDING'
  }]).select().single()

  if (error) throw error
  return data
}

export async function processRecurringExpenses(supabase: SupabaseClient, today: string) {
  const checkDate = new Date(today)
  if (isNaN(checkDate.getTime())) throw new Error("Invalid run date")

  const { data: recurring, error: fetchError } = await supabase
    .from('recurring_expenses')
    .select('*')
    .lte('next_due_date', today)

  if (fetchError) throw fetchError
  if (!recurring || recurring.length === 0) return 0
  
  if (recurring.length > 1000) throw new Error("Safety stop: Excedido el limite de procesamiento en lote (1000)")

  const egresosToInsert = recurring.map(exp => ({
    monto: exp.monto,
    moneda: exp.moneda,
    descripcion: exp.descripcion || "Egreso recurrente",
    categoria_id: exp.categoria_id,
    estado: 'PENDING',
    forma_pago: 'Transferencia',
    proveedor: 'Por definir'
  }))

  const { error: insertError } = await supabase.from('egresos').insert(egresosToInsert)
  if (insertError) throw insertError

  return recurring.length
}
