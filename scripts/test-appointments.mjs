import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

async function testFetch() {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      clients ( full_name, phone ),
      properties ( code, title, projects ( name ) )
    `)
    .eq('id', '44444444-4444-4444-4444-444444444444')
  
  console.log("Error:", error)
  console.log("Data:", JSON.stringify(data, null, 2))
}

testFetch()
