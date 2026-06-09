import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

async function seedData() {
  console.log("Iniciando creación de datos mock...")

  // Fetch users and clients
  const { data: users } = await supabase.from('usuarios').select('id, rol')
  const { data: clients } = await supabase.from('clients').select('id')

  if (!users || users.length === 0) {
    console.log("No hay usuarios en la BD. Ejecuta el script de usuarios primero.")
    return
  }

  const superAdminId = users.find(u => u.rol === 'SUPER_ADMIN')?.id || users[0].id
  const adminId = users.find(u => u.rol === 'ADMIN')?.id || users[0].id
  const asesorId = users.find(u => u.rol === 'ASESOR')?.id || users[0].id
  const contadorId = users.find(u => u.rol === 'CONTADOR')?.id || users[0].id

  // 1. Proyectos
  console.log("Creando Proyectos...")
  const { data: projects, error: projectsErr } = await supabase.from('projects').insert([
    { name: 'Condominio Las Palmas', location: 'TRUJILLO' },
    { name: 'Residencial Huanchaco Beach', location: 'HUANCHACO' },
    { name: 'Urbanización El Sol', location: 'MOCHE' }
  ]).select()

  if (projectsErr) console.error("Error proyectos:", projectsErr)

  // 2. Categorías de Egreso
  console.log("Creando Categorías de Egreso...")
  const { data: categorias, error: catErr } = await supabase.from('categorias_egreso').insert([
    { nombre: 'Publicidad en Redes Sociales' },
    { nombre: 'Gastos Operativos (Agua, Luz)' },
    { nombre: 'Planilla de Asesores' },
    { nombre: 'Mantenimiento de Oficina' }
  ]).select()

  if (catErr) console.error("Error categorias:", catErr)

  // Wait a moment for clients check
  if (!clients || clients.length === 0) {
    console.log("No hay clientes, crearemos 3...")
    const { data: newClients } = await supabase.from('clients').insert([
      { full_name: 'María García', phone: '+51 999 888 777', email: 'maria@gmail.com', status: 'NEW', interest_level: 'MEDIUM' },
      { full_name: 'Carlos Torres', phone: '+51 987 654 321', email: 'carlos.t@hotmail.com', status: 'NEGOTIATION', interest_level: 'HIGH' },
      { full_name: 'Ana Belén', phone: '+51 912 345 678', email: 'ana.belen@empresa.com', status: 'SOLD', interest_level: 'LOW' }
    ]).select()
    clients.push(...(newClients || []))
  }

  // 3. Ingresos
  console.log("Creando Ingresos...")
  if (projects && projects.length > 0 && clients && clients.length > 0) {
    const { error: ingErr } = await supabase.from('ingresos').insert([
      { monto: 1500, moneda: 'PEN', forma_pago: 'Transferencia BCP', numero_operacion: 'OPE-00123', client_id: clients[0].id, property_id: projects[0].id, created_by: contadorId, fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { monto: 5000, moneda: 'USD', forma_pago: 'Cheque de Gerencia', numero_operacion: 'CHQ-99887', client_id: clients[1].id, property_id: projects[1].id, created_by: contadorId, fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { monto: 300, moneda: 'PEN', forma_pago: 'Yape', numero_operacion: 'YAP-11223', client_id: clients[2].id, property_id: projects[2].id, created_by: adminId, fecha: new Date().toISOString() },
    ])
    if (ingErr) console.error("Error ingresos:", ingErr)
  }

  // 4. Egresos
  console.log("Creando Egresos...")
  if (categorias && categorias.length > 0) {
    const { error: egrErr } = await supabase.from('egresos').insert([
      { monto: 800, moneda: 'PEN', descripcion: 'Campaña Facebook Ads Diciembre', proveedor: 'Meta Platforms', forma_pago: 'Tarjeta de Crédito', estado: 'APPROVED', categoria_id: categorias[0].id, created_by: adminId, fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { monto: 150, moneda: 'PEN', descripcion: 'Recibo de Luz', proveedor: 'Hidrandina', forma_pago: 'Pago Efectivo', estado: 'PENDING', categoria_id: categorias[1].id, created_by: contadorId, fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { monto: 3500, moneda: 'PEN', descripcion: 'Sueldo Base Asesores', proveedor: 'Nómina', forma_pago: 'Transferencia Interbancaria', estado: 'APPROVED', categoria_id: categorias[2].id, created_by: superAdminId, fecha: new Date().toISOString() },
    ])
    if (egrErr) console.error("Error egresos:", egrErr)
  }

  // 5. Agenda
  console.log("Creando Eventos en Agenda...")
  if (clients && clients.length > 0) {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    
    const dayAfter = new Date(today)
    dayAfter.setDate(dayAfter.getDate() + 2)
    dayAfter.setHours(15, 30, 0, 0)

    const { error: agErr } = await supabase.from('agenda').insert([
      { titulo: 'Visita guiada a Las Palmas', tipo: 'Visita', estado: 'Confirmado', client_id: clients[0].id, fecha_hora: tomorrow.toISOString(), created_by: asesorId },
      { titulo: 'Firma de Contrato - Lote 12', tipo: 'Firma', estado: 'Pendiente', client_id: clients[1].id, fecha_hora: dayAfter.toISOString(), created_by: adminId },
      { titulo: 'Llamada seguimiento prospección', tipo: 'Llamada', estado: 'Pendiente', client_id: clients[2].id, fecha_hora: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), created_by: asesorId },
    ])
    if (agErr) console.error("Error agenda:", agErr)
  }

  console.log("¡Datos generados exitosamente!")
}

seedData()
