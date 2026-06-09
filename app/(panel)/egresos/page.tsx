import { createClient } from "@/utils/supabase/server"
import { EgresosList } from "@/components/egresos-list"

export default async function EgresosPage() {
  const supabase = await createClient()

  const { data: egresos, error } = await supabase
    .from("egresos")
    .select(`
      *,
      categorias_egreso (
        nombre
      )
    `)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error fetching egresos:", error)
  }

  // Fetch categories to populate the "Categoría" dropdown in the form
  const { data: categorias } = await supabase
    .from("categorias_egreso")
    .select("id, nombre")
    .order("nombre")

  // Fetch user role
  const { data: { user } } = await supabase.auth.getUser()
  let userRole = ""
  if (user) {
    const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
    userRole = profile?.rol || ""
  }

  return <EgresosList initialEgresos={egresos || []} categorias={categorias || []} userRole={userRole} />
}
