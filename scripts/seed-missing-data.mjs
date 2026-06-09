import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

async function seedMissingData() {
  console.log("Creando Proyectos e Ingresos faltantes...")

  // Fetch users and clients
  const { data: users } = await supabase.from('usuarios').select('id, rol')
  const { data: clients } = await supabase.from('clients').select('id')

  if (!users || users.length === 0) {
    console.log("No hay usuarios en la BD.")
    return
  }

  const contadorId = users.find(u => u.rol === 'CONTADOR')?.id || users[0].id
  const adminId = users.find(u => u.rol === 'ADMIN')?.id || users[0].id

  // 1. Proyectos
  console.log("Creando Proyectos...")
  const { data: projects, error: projectsErr } = await supabase.from('projects').insert([
    { name: 'Condominio Las Palmas', location: 'TRUJILLO' },
    { name: 'Residencial Huanchaco Beach', location: 'HUANCHACO' },
    { name: 'Urbanización El Sol', location: 'MOCHE' }
  ]).select()

  if (projectsErr) {
    console.error("Error proyectos:", projectsErr)
    return
  }

  // 2. Ingresos
  console.log("Creando Ingresos...")
  if (projects && projects.length > 0 && clients && clients.length >= 3) {
    const { error: ingErr } = await supabase.from('ingresos').insert([
      { monto: 1500, moneda: 'PEN', forma_pago: 'Transferencia BCP', numero_operacion: 'OPE-00123', client_id: clients[0].id, created_by: contadorId, fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { monto: 5000, moneda: 'USD', forma_pago: 'Cheque de Gerencia', numero_operacion: 'CHQ-99887', client_id: clients[1].id, created_by: contadorId, fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { monto: 300, moneda: 'PEN', forma_pago: 'Yape', numero_operacion: 'YAP-11223', client_id: clients[2].id, created_by: adminId, fecha: new Date().toISOString() },
    ])
    if (ingErr) console.error("Error ingresos:", ingErr)
  } else {
    console.log("No hay suficientes clientes para asignar ingresos.")
  }

  console.log("¡Proyectos e Ingresos generados exitosamente!")
}

seedMissingData()
