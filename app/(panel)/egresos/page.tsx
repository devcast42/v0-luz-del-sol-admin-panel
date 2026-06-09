import { FinanzasTable } from "@/components/finanzas-table"
import { MOCK_EGRESOS } from "@/lib/mock-data"

export default function EgresosPage() {
  return (
    <FinanzasTable
      titulo="Egresos"
      descripcion="Planilla, marketing y gastos operativos."
      data={MOCK_EGRESOS}
      variant="egreso"
    />
  )
}
