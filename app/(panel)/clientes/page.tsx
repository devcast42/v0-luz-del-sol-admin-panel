import { createClient } from "@/utils/supabase/server"
import { ClientesList } from "@/components/clientes-list"

export default async function ClientesPage() {
  const supabase = await createClient()

  // Fetch clients from Supabase
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching clients:", error)
  }

  return <ClientesList initialClientes={clients || []} />
}

