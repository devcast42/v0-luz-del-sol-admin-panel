import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

async function getSchema() {
  const tables = ['properties', 'appointments', 'interactions', 'projects']
  
  for (const table of tables) {
    // try to insert an invalid record just to get the schema from the error, or fetch 1 record.
    // Since there might be no records, fetching 1 might return [] with no keys.
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (data && data.length > 0) {
      console.log(`Table ${table} keys:`, Object.keys(data[0]).join(', '))
    } else {
      // Create a dummy record to fail and see if it gives column hints, or just insert empty to see missing required
      const { error: insErr } = await supabase.from(table).insert({ id: '00000000-0000-0000-0000-000000000000' })
      console.log(`Table ${table} error on insert:`, insErr?.message || 'Success?!')
    }
  }
}

getSchema()
