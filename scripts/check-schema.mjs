import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

async function checkSchema() {
  const { data: appt } = await supabase.from('appointments').select('*').limit(1)
  const { data: agenda } = await supabase.from('agenda').select('*').limit(1)
  const { data: props } = await supabase.from('properties').select('*').limit(1)
  const { data: projs } = await supabase.from('projects').select('*').limit(1)
  const { data: inter } = await supabase.from('interactions').select('*').limit(1)
  
  console.log("Appointments works:", appt !== null)
  console.log("Agenda works:", agenda !== null)
  console.log("Properties works:", props !== null)
  console.log("Projects works:", projs !== null)
  console.log("Interactions works:", inter !== null)
}

checkSchema()
