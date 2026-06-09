import { createClient } from "@/utils/supabase/server"
import { IngresosList } from "@/components/ingresos-list"

export default async function IngresosPage() {
  const supabase = await createClient()

  // Fetch ingresos joining with clients
  const { data: ingresos, error } = await supabase
    .from("ingresos")
    .select(`
      *,
      clients (
        full_name,
        email
      )
    `)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error fetching ingresos:", error)
  }

  // Fetch clients to populate the "Client" dropdown in the form
  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name")

  return <IngresosList initialIngresos={ingresos || []} clients={clients || []} />
}
