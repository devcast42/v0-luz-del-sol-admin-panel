import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// You must configure these in your environment / Make.com to call securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Usa la service key para evadir RLS si es necesario

const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(request: Request) {
  try {
    // 1. Fetch all recurring expenses where next_due_date is today or in the past
    const today = new Date().toISOString().split('T')[0]
    
    const { data: recurring, error: fetchError } = await supabase
      .from('recurring_expenses')
      .select('*')
      .lte('next_due_date', today)

    if (fetchError) throw fetchError
    if (!recurring || recurring.length === 0) {
      return NextResponse.json({ message: 'No recurring expenses to process today' })
    }

    const egresosToInsert = []
    const expensesToUpdate = []

    for (const exp of recurring) {
      // Create new Egreso
      egresosToInsert.push({
        monto: exp.monto,
        moneda: exp.moneda,
        descripcion: exp.descripcion || "Egreso recurrente",
        categoria_id: exp.categoria_id,
        estado: 'PENDING',
        forma_pago: 'Transferencia', // Default
        proveedor: 'Por definir'
      })

      // Calculate next due date
      const currentDate = new Date(exp.next_due_date)
      if (exp.frecuencia === 'MONTHLY') {
        currentDate.setMonth(currentDate.getMonth() + 1)
      } else if (exp.frecuencia === 'WEEKLY') {
        currentDate.setDate(currentDate.getDate() + 7)
      } else if (exp.frecuencia === 'YEARLY') {
        currentDate.setFullYear(currentDate.getFullYear() + 1)
      }

      expensesToUpdate.push({
        id: exp.id,
        next_due_date: currentDate.toISOString().split('T')[0]
      })
    }

    // Insert pending egresos
    const { error: insertError } = await supabase.from('egresos').insert(egresosToInsert)
    if (insertError) throw insertError

    // Update next_due_date for processed templates
    for (const update of expensesToUpdate) {
      await supabase.from('recurring_expenses').update({ next_due_date: update.next_due_date }).eq('id', update.id)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${recurring.length} recurring expenses`
    })

  } catch (error: any) {
    console.error("Recurring expenses error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
