import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

async function checkDB() {
  const { data: users } = await supabase.from('usuarios').select('*')
  const { data: clients } = await supabase.from('clients').select('*')
  const { data: projects } = await supabase.from('projects').select('*')
  const { data: categorias } = await supabase.from('categorias_egreso').select('*')
  const { data: ingresos } = await supabase.from('ingresos').select('*')
  const { data: egresos } = await supabase.from('egresos').select('*')
  const { data: agenda } = await supabase.from('agenda').select('*')

  console.log("--- DB STATUS ---")
  console.log("Usuarios:", users?.length || 0)
  console.log("Clientes:", clients?.length || 0)
  console.log("Proyectos:", projects?.length || 0)
  console.log("Categorías Egreso:", categorias?.length || 0)
  console.log("Ingresos:", ingresos?.length || 0)
  console.log("Egresos:", egresos?.length || 0)
  console.log("Agenda:", agenda?.length || 0)
}

checkDB()
