import { createClient } from "@/utils/supabase/server"
import { TerrenosList } from "@/components/terrenos-list"
import { redirect } from "next/navigation"

export default async function TerrenosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  const role = profile?.rol || ''

  const { data: properties, error } = await supabase
    .from("properties")
    .select(`
      *,
      projects ( name )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching properties:", error)
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .order("name")

  return <TerrenosList 
    initialProperties={properties || []} 
    projects={projects || []}
    userRole={role}
  />
}
