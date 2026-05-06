import { FinanzasTable } from "@/components/finanzas-table"
import { MOCK_INGRESOS } from "@/lib/mock-data"

export default function IngresosPage() {
  return (
    <FinanzasTable
      titulo="Ingresos"
      descripcion="Comisiones, alquileres y cobros de la empresa."
      data={MOCK_INGRESOS}
      variant="ingreso"
    />
  )
}
