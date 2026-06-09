import { createClient } from "@/utils/supabase/server"
import { ReportesView } from "@/components/reportes-view"

export default async function ReportesPage() {
  const supabase = await createClient()

  // Fetch real data
  const { data: ingresos } = await supabase.from('ingresos').select('*')
  const { data: egresos } = await supabase.from('egresos').select('*, categorias_egreso(nombre)')

  return <ReportesView ingresos={ingresos || []} egresos={egresos || []} />
}
