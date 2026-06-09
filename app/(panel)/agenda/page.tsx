import { createClient } from "@/utils/supabase/server"
import { AgendaList } from "@/components/agenda-list"
import { redirect } from "next/navigation"

export default async function AgendaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  const role = profile?.rol || ''

  let query = supabase
    .from("appointments")
    .select(`
      *,
      clients ( full_name, phone ),
      properties ( code, title, projects ( name ) )
    `)
    .order("appointment_date", { ascending: true })

  // Asumiendo que agregaremos la columna user_id a appointments
  if (role === 'ASESOR') {
    query = query.eq('user_id', user.id)
  }

  const { data: agenda, error } = await query

  if (error) {
    console.error("Error fetching appointments:", error)
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name")
    .order("full_name")

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, code")
    .order("title")

  return <AgendaList 
    initialAgenda={agenda || []} 
    clients={clients || []} 
    properties={properties || []}
    userRole={role}
    userId={user.id}
  />
}
